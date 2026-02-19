import pandas as pd
import numpy as np
import os
from sklearn.preprocessing import MinMaxScaler
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.cluster import DBSCAN
from datetime import timedelta

# Set paths
base_path = os.path.dirname(os.path.abspath(__file__))
# Support legacy `data` folder and new `Data set` folder (note space)
# Prefer the canonical `data` folder first (user placed NEW CSVs in backend/data)
data_dirs = [os.path.join(base_path, 'data'), os.path.join(base_path, 'Data set')]
data_path = None
for d in data_dirs:
    if os.path.exists(d):
        data_path = d
        break
if data_path is None:
    # fallback to base data path even if missing, to keep previous behavior
    data_path = os.path.join(base_path, 'data')
output_path = os.path.join(base_path, 'ml_outputs')

if not os.path.exists(output_path):
    os.makedirs(output_path)

# --- STEP 1: DATA LOADING ---
print("Loading datasets...")
hospital_candidates = [
    os.path.join(data_path, 'NEW HOSPITAL ALL.csv'),
    os.path.join(data_path, 'NEW_HOSPITAL_ALL.csv'),
    os.path.join(data_path, 'hospital_timeseries_6months_REAL.csv')
]
water_candidates = [
    os.path.join(data_path, 'NEW WATER ALL.csv'),
    os.path.join(data_path, 'NEW_WATER_ALL.csv'),
    os.path.join(data_path, 'water_quality_6months_REAL.csv')
]

def _pick_existing(path_list):
    for p in path_list:
        if os.path.exists(p):
            return p
    return path_list[0]

hospital_path = _pick_existing(hospital_candidates)
water_path = _pick_existing(water_candidates)

print(f"Using hospital file: {os.path.basename(hospital_path)}")
print(f"Using water file: {os.path.basename(water_path)}")

hospital_df = pd.read_csv(hospital_path)
water_df = pd.read_csv(water_path)

# Parse timestamps
hospital_df['date'] = pd.to_datetime(hospital_df['date'])
water_df['date'] = pd.to_datetime(water_df['date'])

# Normalize city names and get a mapping for hospital_id to city
# New dataset layout: hospital file contains `city`, water file may not.
# Prefer hospital_df for hospital_id -> city mapping.
city_map = hospital_df.groupby('hospital_id')['city'].first().to_dict()
hospital_df['city'] = hospital_df['hospital_id'].map(city_map)
# If some hospital rows lacked city, fall back to water file if available
if 'city' in water_df.columns:
    water_city_map = water_df.groupby('hospital_id')['city'].first().to_dict()
    # fill missing from water mapping
    hospital_df['city'] = hospital_df.apply(lambda r: r['city'] if pd.notna(r['city']) and r['city'] != '' else water_city_map.get(r['hospital_id'], r['city']), axis=1)
else:
    # If water_df doesn't have city, populate it from hospital mapping so merge works
    water_df['city'] = water_df['hospital_id'].map(city_map)

# Handle "New Delhi" -> "Delhi" to match user's geo mapping
hospital_df['city'] = hospital_df['city'].replace({'New Delhi': 'Delhi'})
if 'city' in water_df.columns:
    water_df['city'] = water_df['city'].replace({'New Delhi': 'Delhi'})

# Merge on city + date
print("Merging datasets...")
merged_df = pd.merge(hospital_df, water_df, on=['city', 'date', 'hospital_id'], how='inner', suffixes=('', '_water'))

# --- STEP 2: GEO ENRICHMENT ---
print("Applying geo enrichment...")
geo_mapping = {
    'Delhi': [28.6139, 77.2090],
    'Mumbai': [19.0760, 72.8777],
    'Chennai': [13.0827, 80.2707],
    'Kolkata': [22.5726, 88.3639],
    'Bengaluru': [12.9716, 77.5946],
    'Bangalore': [12.9716, 77.5946],
    'Hyderabad': [17.3850, 78.4867],
    'Pune': [18.5204, 73.8567],
    'Jaipur': [26.9124, 75.7873],
    'Lucknow': [26.8467, 80.9462],
    'Nagpur': [21.1458, 79.0882],
    'Kochi': [9.9312, 76.2673],
    'Varanasi': [25.3176, 82.9739],
    'Vellore': [12.9165, 79.1325],
    'Puducherry': [11.9416, 79.8083],
    'Gurugram': [28.4595, 77.0266],
    'Chandigarh': [30.7333, 76.7794]
}

merged_df['lat'] = merged_df['city'].map(lambda x: geo_mapping.get(x, [20.5937, 78.9629])[0])
merged_df['lng'] = merged_df['city'].map(lambda x: geo_mapping.get(x, [20.5937, 78.9629])[1])

# --- STEP 3: FEATURE ENGINEERING ---
print("Engineering features...")

# Normalize possible temperature column names
for df in (hospital_df, water_df):
    if 'water_temperature_C' in df.columns and 'water_temp_C' not in df.columns:
        df.rename(columns={'water_temperature_C': 'water_temp_C'}, inplace=True)

# Sort by city and date for rolling calculations
merged_df = merged_df.sort_values(['city', 'date'])

# Temporal Features
merged_df['rolling_cases_24h'] = merged_df.groupby('city')['admissions'].transform(lambda x: x.rolling(window=1).mean())
merged_df['rolling_cases_72h'] = merged_df.groupby('city')['admissions'].transform(lambda x: x.rolling(window=3).mean())
merged_df['delta_cases'] = merged_df.groupby('city')['admissions'].diff().fillna(0)
merged_df['case_growth_rate'] = (merged_df['delta_cases'] / merged_df.groupby('city')['admissions'].shift(1).replace(0, 1)).fillna(0)

# Water Features
# water_contamination_index = (0.4 * turbidity) + (0.4 * fecal_coliform) + (0.2 * abs(7 - ph))
merged_df['water_contamination_index'] = (
    0.4 * merged_df['turbidity_NTU'] + 
    0.4 * merged_df['fecal_coliform_cfu_100ml'] + 
    0.2 * (7 - merged_df['water_pH']).abs()
)

# Environmental Proxy Features (Simulated)
# humidity_index (simulated from water temp and DO)
# rainfall_index (simulated from turbidity peaks)
if 'water_temp_C' in merged_df.columns:
    merged_df['humidity_index'] = (merged_df['water_temp_C'] / merged_df['water_temp_C'].max()).fillna(0.5)
else:
    merged_df['humidity_index'] = 0.5
merged_df['rainfall_index'] = (merged_df['turbidity_NTU'] / merged_df['turbidity_NTU'].max()).fillna(0.1)
merged_df['environmental_risk_index'] = (merged_df['humidity_index'] * 0.5 + merged_df['rainfall_index'] * 0.5)

# Fill NaNs from rolling results
merged_df = merged_df.fillna(0)

# Normalize Final Feature Vector 0-1
features_to_normalize = [
    'rolling_cases_24h', 'rolling_cases_72h', 'delta_cases', 'case_growth_rate',
    'water_contamination_index', 'humidity_index', 'rainfall_index', 'environmental_risk_index',
    'bed_occupancy_rate'
]
scaler = MinMaxScaler()
merged_df[features_to_normalize] = scaler.fit_transform(merged_df[features_to_normalize])

# --- STEP 4: 48-HOUR OUTBREAK FORECASTING ---
print("Training forecasting model...")

# Target: future_cases_48h (Shift admissions forward 2 days)
merged_df['future_cases_48h'] = merged_df.groupby('city')['admissions'].shift(-2)

# Drop rows where we don't have target (last 2 days)
train_df = merged_df.dropna(subset=['future_cases_48h'])

# Model setup
rf = RandomForestRegressor(n_estimators=200, max_depth=12, random_state=42)
X_cols = ['rolling_cases_72h', 'water_contamination_index', 'humidity_index', 'rainfall_index', 'bed_occupancy_rate']
rf.fit(train_df[X_cols], train_df['future_cases_48h'])

# Generate predictions for all rows (even where target is missing, using features)
merged_df['predicted_cases_48h'] = rf.predict(merged_df[X_cols])

# Fill any final NaNs just in case
merged_df = merged_df.fillna(0)

# Export predictions
merged_df[['city', 'date', 'predicted_cases_48h']].to_csv(os.path.join(output_path, 'predictions.csv'), index=False)

# --- STEP 5: RISK SCORE ENGINE ---
print("Calculating risk scores...")

# riskScore = 0.4 * predicted_cases + 0.3 * water_contamination_index + 0.2 * humidity_index + 0.1 * rainfall_index
# Note: predicted_cases is raw case count, we should probably normalize it for the formula or use the trend.
# The user formula: 0.4 * predicted_cases + ...
# Let's use the predicted cases scaled to a reasonable range for the score if it's too high,
# but the user said "Scale result to 0-100".
merged_df['raw_risk_score'] = (
    0.4 * merged_df['predicted_cases_48h'] +
    0.3 * (merged_df['water_contamination_index'] * 100) + # multiplier because water_contamination_index is normalized [0,1]
    0.2 * (merged_df['humidity_index'] * 100) +
    0.1 * (merged_df['rainfall_index'] * 100)
)

# Final Scaling to 0-100
risk_scaler = MinMaxScaler(feature_range=(0, 100))
merged_df['riskScore'] = risk_scaler.fit_transform(merged_df[['raw_risk_score']])

# --- STEP 6: RISK CLASSIFICATION ---
print("Classifying risk levels...")

def classify_risk(score):
    if score >= 85: return 'Critical'
    if score >= 70: return 'High'
    if score >= 60: return 'High-Mod'
    if score >= 45: return 'Moderate'
    if score >= 30: return 'Low-Mod'
    if score >= 15: return 'Low'
    return 'Very Low'

merged_df['riskLevel'] = merged_df['riskScore'].apply(classify_risk)

# Export Risk Scores
merged_df[['city', 'date', 'riskScore', 'riskLevel']].to_csv(os.path.join(output_path, 'riskScores.csv'), index=False)

# --- STEP 7: ANOMALY DETECTION ---
print("Detecting anomalies...")
iso_forest = IsolationForest(contamination=0.1, random_state=42)
anomaly_features = ['admissions', 'water_contamination_index', 'case_growth_rate']
merged_df['anomaly_val'] = iso_forest.fit_predict(merged_df[anomaly_features])
merged_df['is_anomaly'] = merged_df['anomaly_val'] == -1
merged_df['anomaly_score'] = iso_forest.decision_function(merged_df[anomaly_features])

# Export Anomalies
merged_df[['city', 'date', 'is_anomaly', 'anomaly_score']].to_csv(os.path.join(output_path, 'anomalies.csv'), index=False)

import pickle
models_path = os.path.join(base_path, 'models')
if not os.path.exists(models_path):
    os.makedirs(models_path)

with open(os.path.join(models_path, 'outbreak_rf.pkl'), 'wb') as f:
    pickle.dump(rf, f)
with open(os.path.join(models_path, 'anomaly_iso.pkl'), 'wb') as f:
    pickle.dump(iso_forest, f)
with open(os.path.join(models_path, 'scaler.pkl'), 'wb') as f:
    pickle.dump(scaler, f)
with open(os.path.join(models_path, 'risk_scaler.pkl'), 'wb') as f:
    pickle.dump(risk_scaler, f)

# --- STEP 8: HOTSPOT DETECTION ---
print("Clustering hotspots...")
# Latest snapshot per city/hospital
latest_snapshot = merged_df.groupby(['city', 'hospital_id']).tail(1).copy()

dbscan = DBSCAN(eps=0.5, min_samples=3)
# Input: lat, lng, riskScore. 
# We use raw lat/lng so eps=0.5 is degrees (~55km). 
# We only scale riskScore if needed, but let's keep it simple as requested.
cluster_data = latest_snapshot[['lat', 'lng', 'riskScore']]
latest_snapshot['cluster'] = dbscan.fit_predict(cluster_data[['lat', 'lng']]) # Cluster on geo only

# Aggregate cluster info
hotspots = []
for cluster_id in latest_snapshot['cluster'].unique():
    if cluster_id == -1: continue # Noise
    cluster_points = latest_snapshot[latest_snapshot['cluster'] == cluster_id]
    hotspots.append({
        'zone_id': f"ZONE_{cluster_id}",
        'cluster_center_lat': cluster_points['lat'].mean(),
        'cluster_center_lng': cluster_points['lng'].mean(),
        'avg_risk': cluster_points['riskScore'].mean(),
        'cluster_size': len(cluster_points)
    })

zones_df = pd.DataFrame(hotspots)
# Fallback if no clusters
if zones_df.empty:
    print("No DBSCAN clusters found with eps=0.5 (cities too far apart). Creating fallback zones from high-risk cities.")
    high_risk = latest_snapshot[latest_snapshot['riskScore'] > 60]
    if high_risk.empty: high_risk = latest_snapshot.nlargest(5, 'riskScore')
    zones_df = high_risk[['city', 'lat', 'lng', 'riskScore']].rename(columns={
        'city': 'zone_id',
        'lat': 'cluster_center_lat',
        'lng': 'cluster_center_lng',
        'riskScore': 'avg_risk'
    })
    zones_df['cluster_size'] = 1

zones_df.to_csv(os.path.join(output_path, 'zones.csv'), index=False)

# Export final merged features for backend
merged_df.to_csv(os.path.join(output_path, 'merged_features.csv'), index=False)

# --- STEP 9: QUALITY CHECKS ---
print("\n--- QUALITY CHECKS ---")
print(f"NaN Count: {merged_df.isna().sum().sum()}")
print(f"Risk Score Range: {merged_df['riskScore'].min():.2f} - {merged_df['riskScore'].max():.2f}")
print(f"Total Rows: {len(merged_df)}")
print(f"Cities Processed: {merged_df['city'].unique()}")
print(f"Files exported to {output_path}")

print("\nSummary Stats:")
print(merged_df[['predicted_cases_48h', 'riskScore']].describe())



