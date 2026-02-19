from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
import io
import os
import pickle

router = APIRouter()

# Geo mapping (same as ml_engine.py)
GEO_MAPPING = {
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

# --- Actual column names from the real CSVs ---
# Hospital CSV:  date, hospital_id, admissions, bed_occupancy_rate, water_pH,
#                turbidity_NTU, fecal_coliform_cfu_100ml, water_temp_C, ...
# Water CSV:     date, hospital_id, city, water_pH, turbidity_NTU,
#                fecal_coliform_cfu_100ml, water_temperature_C, ...

REQUIRED_HOSPITAL_COLS = ['date', 'hospital_id', 'admissions', 'bed_occupancy_rate']
REQUIRED_WATER_COLS    = ['date', 'hospital_id', 'water_pH', 'turbidity_NTU', 'fecal_coliform_cfu_100ml']


@router.post("/scenario-upload")
async def scenario_upload(
    hospital_file: UploadFile = File(...),
    water_file: UploadFile = File(...)
):
    try:
        # ── 1. Read uploaded bytes ──────────────────────────────────────────
        h_bytes = await hospital_file.read()
        w_bytes = await water_file.read()

        hospital_df = pd.read_csv(io.BytesIO(h_bytes))
        water_df    = pd.read_csv(io.BytesIO(w_bytes))

        # ── 2. Validate required columns ───────────────────────────────────
        missing_h = [c for c in REQUIRED_HOSPITAL_COLS if c not in hospital_df.columns]
        missing_w = [c for c in REQUIRED_WATER_COLS    if c not in water_df.columns]

        if missing_h or missing_w:
            raise HTTPException(
                status_code=400,
                detail=f"Missing columns — Hospital: {missing_h}, Water: {missing_w}"
            )

        # ── 3. Normalise water_temp column name ────────────────────────────
        # Water CSV may use 'water_temperature_C' instead of 'water_temp_C'
        if 'water_temperature_C' in water_df.columns and 'water_temp_C' not in water_df.columns:
            water_df = water_df.rename(columns={'water_temperature_C': 'water_temp_C'})

        # Also handle hospital CSV that already has the column
        if 'water_temperature_C' in hospital_df.columns and 'water_temp_C' not in hospital_df.columns:
            hospital_df = hospital_df.rename(columns={'water_temperature_C': 'water_temp_C'})

        # ── 4. Parse timestamps ────────────────────────────────────────────
        hospital_df['date'] = pd.to_datetime(hospital_df['date'])
        water_df['date']    = pd.to_datetime(water_df['date'])

        # ── 5. Normalise city names ────────────────────────────────────────
        # If water file lacks `city`, derive it from the hospital file's mapping
        if 'city' not in water_df.columns:
            city_map = hospital_df.groupby('hospital_id')['city'].first().to_dict()
            water_df['city'] = water_df['hospital_id'].map(city_map)

        water_df['city'] = water_df['city'].replace({'New Delhi': 'Delhi'})

        # ── 6. Merge on hospital_id + date ────────────────────────────────
        merged_df = pd.merge(
            hospital_df, water_df,
            on=['date', 'hospital_id'],
            how='inner',
            suffixes=('', '_water')
        )

        if merged_df.empty:
            raise HTTPException(status_code=400, detail="Merge produced 0 rows. Check hospital_id / date alignment.")

        # Prefer water file's city; fall back to hospital derived city
        if 'city' not in merged_df.columns:
            raise HTTPException(status_code=400, detail="'city' column missing after merge.")

        merged_df['city'] = merged_df['city'].replace({'New Delhi': 'Delhi'})

        # ── 7. Geo enrichment ─────────────────────────────────────────────
        merged_df['lat'] = merged_df['city'].map(lambda x: GEO_MAPPING.get(x, [20.5937, 78.9629])[0])
        merged_df['lng'] = merged_df['city'].map(lambda x: GEO_MAPPING.get(x, [20.5937, 78.9629])[1])

        # ── 8. Feature engineering ────────────────────────────────────────
        merged_df = merged_df.sort_values(['city', 'date'])

        merged_df['rolling_cases_24h'] = (
            merged_df.groupby('city')['admissions']
            .transform(lambda x: x.rolling(window=1).mean())
        )
        merged_df['rolling_cases_72h'] = (
            merged_df.groupby('city')['admissions']
            .transform(lambda x: x.rolling(window=3).mean())
        )
        merged_df['delta_cases'] = (
            merged_df.groupby('city')['admissions'].diff().fillna(0)
        )
        prev = merged_df.groupby('city')['admissions'].shift(1).replace(0, 1)
        merged_df['case_growth_rate'] = (merged_df['delta_cases'] / prev).fillna(0)

        # Water contamination index
        merged_df['water_contamination_index'] = (
            0.4 * merged_df['turbidity_NTU'] +
            0.4 * merged_df['fecal_coliform_cfu_100ml'] +
            0.2 * (7 - merged_df['water_pH']).abs()
        )

        # Environmental proxies
        # Use water_temp_C — may come from hospital OR water CSV after rename
        temp_col = 'water_temp_C' if 'water_temp_C' in merged_df.columns else None
        if temp_col:
            max_temp = merged_df[temp_col].max()
            merged_df['humidity_index'] = (merged_df[temp_col] / max_temp).fillna(0.5)
        else:
            merged_df['humidity_index'] = 0.5

        max_turb = merged_df['turbidity_NTU'].max()
        merged_df['rainfall_index'] = (merged_df['turbidity_NTU'] / max_turb).fillna(0.1)
        merged_df['environmental_risk_index'] = (
            merged_df['humidity_index'] * 0.5 + merged_df['rainfall_index'] * 0.5
        )

        merged_df = merged_df.fillna(0)

        # ── 9. Load production models ─────────────────────────────────────
        base_path   = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        models_path = os.path.join(base_path, 'models')

        model_files = ['scaler.pkl', 'outbreak_rf.pkl', 'anomaly_iso.pkl', 'risk_scaler.pkl']
        missing_models = [f for f in model_files if not os.path.exists(os.path.join(models_path, f))]
        if missing_models:
            raise HTTPException(
                status_code=500,
                detail=f"Model files missing: {missing_models}. Run ml_engine.py first."
            )

        with open(os.path.join(models_path, 'scaler.pkl'), 'rb') as f:
            scaler = pickle.load(f)
        with open(os.path.join(models_path, 'outbreak_rf.pkl'), 'rb') as f:
            rf = pickle.load(f)
        with open(os.path.join(models_path, 'anomaly_iso.pkl'), 'rb') as f:
            iso_forest = pickle.load(f)
        with open(os.path.join(models_path, 'risk_scaler.pkl'), 'rb') as f:
            risk_scaler = pickle.load(f)

        # ── 10. Normalize features ────────────────────────────────────────
        features_to_normalize = [
            'rolling_cases_24h', 'rolling_cases_72h', 'delta_cases', 'case_growth_rate',
            'water_contamination_index', 'humidity_index', 'rainfall_index',
            'environmental_risk_index', 'bed_occupancy_rate'
        ]
        # Clamp to scaler range to avoid transform errors
        merged_df[features_to_normalize] = scaler.transform(merged_df[features_to_normalize])

        # ── 11. ML Inference ──────────────────────────────────────────────
        rf_cols = ['rolling_cases_72h', 'water_contamination_index',
                   'humidity_index', 'rainfall_index', 'bed_occupancy_rate']
        merged_df['predicted_cases_48h'] = rf.predict(merged_df[rf_cols])

        iso_cols = ['admissions', 'water_contamination_index', 'case_growth_rate']
        merged_df['anomaly_flag'] = iso_forest.predict(merged_df[iso_cols])
        merged_df['is_anomaly']   = merged_df['anomaly_flag'] == -1

        # ── 12. Risk scoring ──────────────────────────────────────────────
        merged_df['raw_risk_score'] = (
            0.4 * merged_df['predicted_cases_48h'] +
            0.3 * (merged_df['water_contamination_index'] * 100) +
            0.2 * (merged_df['humidity_index'] * 100) +
            0.1 * (merged_df['rainfall_index'] * 100)
        )
        merged_df['riskScore'] = risk_scaler.transform(merged_df[['raw_risk_score']])

        def classify_risk(score):
            if score >= 85: return 'Critical'
            if score >= 70: return 'High'
            if score >= 55: return 'High-Mod'
            if score >= 40: return 'Moderate'
            if score >= 25: return 'Low-Mod'
            if score >= 10: return 'Low'
            return 'Very Low'

        merged_df['riskLevel'] = merged_df['riskScore'].apply(classify_risk)

        # ── 13. Build response from latest row ────────────────────────────
        latest = merged_df.iloc[-1]

        history_5d = merged_df.tail(5)
        if len(history_5d) > 1:
            slope = history_5d['riskScore'].iloc[-1] - history_5d['riskScore'].iloc[0]
            trend = "Rising" if slope > 5 else "Falling" if slope < -5 else "Stable"
        else:
            trend = "Stable"

        water_risk = (
            "High Contamination" if latest['water_contamination_index'] > 0.7
            else "Moderate Contamination" if latest['water_contamination_index'] > 0.4
            else "Normal Range"
        )
        env_risk = (
            "Elevated Humidity/Rainfall" if latest['environmental_risk_index'] > 0.7
            else "Moderate" if latest['environmental_risk_index'] > 0.4
            else "Stable"
        )

        chart_data = [
            {"name": str(row['date'])[:10][5:], "risk": int(row['riskScore'])}
            for _, row in merged_df.tail(10).iterrows()
        ]

        return {
            "predicted_cases": int(latest['predicted_cases_48h']),
            "riskScore":        int(latest['riskScore']),
            "riskLevel":        str(latest['riskLevel']),
            "anomaly":          bool(latest['is_anomaly']),
            "analysis": {
                "waterRisk":       water_risk,
                "environmentRisk": env_risk,
                "trend":           trend
            },
            "chartData": chart_data
        }

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")
