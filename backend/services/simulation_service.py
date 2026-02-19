import pandas as pd
import numpy as np
import os
import random
import hashlib
import pickle
from datetime import datetime, timedelta
from .data_loader import data_loader

class SimulationService:
    def __init__(self):
        self.base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.models_path = os.path.join(self.base_path, 'models')
        self.rf = None
        self.iso_forest = None
        self.scaler = None
        self.risk_scaler = None
        
        # Outbreak Lifecycle State Tracking (per-city deterministic RNG)
        # state: { phase, step, duration, rng }
        self.city_states = {}

        # Phase order and next mapping
        self.phases = ["baseline", "growth", "peak", "decay"]
        self.phase_next = {p: self.phases[(i + 1) % len(self.phases)] for i, p in enumerate(self.phases)}
        
        self._load_models()

    def _load_models(self):
        try:
            with open(os.path.join(self.models_path, 'outbreak_rf.pkl'), 'rb') as f:
                self.rf = pickle.load(f)
            with open(os.path.join(self.models_path, 'anomaly_iso.pkl'), 'rb') as f:
                self.iso_forest = pickle.load(f)
            with open(os.path.join(self.models_path, 'scaler.pkl'), 'rb') as f:
                self.scaler = pickle.load(f)
            with open(os.path.join(self.models_path, 'risk_scaler.pkl'), 'rb') as f:
                self.risk_scaler = pickle.load(f)
            print("Simulation models loaded successfully.")
        except Exception as e:
            print(f"Error loading simulation models: {e}")

    def _get_next_phase_value(self, city):
        # Initialize deterministic per-city RNG and state
        if city not in self.city_states:
            # Create stable seed from city name
            digest = hashlib.md5(city.encode('utf-8')).digest()
            seed = int.from_bytes(digest[:4], 'big')
            rng = random.Random(seed)
            # Start at a staggered phase and random step so cities differ
            start_phase = rng.choice(self.phases)
            start_step = rng.randint(0, rng.randint(0, 2))
            duration = rng.randint(3, 6)
            self.city_states[city] = {
                "phase": start_phase,
                "step": start_step,
                "duration": duration,
                "rng": rng
            }

        state = self.city_states[city]
        rng = state.get("rng", random)

        # Advance step and handle phase transition
        state["step"] += 1
        if state["step"] >= state.get("duration", 4):
            # move to next phase and set a new phase-specific duration
            state["phase"] = self.phase_next.get(state["phase"], "baseline")
            state["step"] = 0
            next_phase = state["phase"]
            # Longer durations for growth/peak to allow sustained outbreaks
            if next_phase == "baseline":
                state["duration"] = rng.randint(2, 4)
            elif next_phase == "growth":
                state["duration"] = rng.randint(5, 8)
            elif next_phase == "peak":
                state["duration"] = rng.randint(6, 10)
            elif next_phase == "decay":
                state["duration"] = rng.randint(3, 6)

        phase = state["phase"]
        # Return admission delta based on current phase (deterministic via rng)
        if phase == "baseline":
            return rng.randint(0, 2)
        if phase == "growth":
            # stronger growth to produce more high-risk zones
            return rng.randint(8, 18)
        if phase == "peak":
            # larger peaks to push some cities into Critical
            return rng.randint(25, 45)
        if phase == "decay":
            return -rng.randint(8, 20)
        return rng.randint(0, 2)

    def simulate_tick(self):
        """
        Advances the simulation by ONE DAY.
        Creates a new snapshot of data, runs inference, and appends to memory.
        """
        df = data_loader.data.get("merged")
        if df is None or df.empty:
            merged_path = os.path.join(self.base_path, 'ml_outputs', 'merged_features.csv')
            df = pd.read_csv(merged_path)
            if 'date' in df.columns:
                df['date'] = pd.to_datetime(df['date'])

        # Accept alternative water temperature column name
        if 'water_temperature_C' in df.columns and 'water_temp_C' not in df.columns:
            df['water_temp_C'] = df['water_temperature_C']

        latest_date = pd.to_datetime(df['date']).max()
        next_date = latest_date + timedelta(days=1)
        
        last_snapshot = df[df['date'] == latest_date].copy()
        
        new_rows = []
        max_temp = df['water_temp_C'].max() if ('water_temp_C' in df.columns and not df['water_temp_C'].empty) else 35

        for _, row in last_snapshot.iterrows():
            new_row = row.copy()
            new_row['date'] = next_date
            city = new_row['city']
            
            # Follow Lifecycle
            drift = self._get_next_phase_value(city)
            new_row['admissions'] = max(0, new_row['admissions'] + drift)
            
            current_phase = self.city_states[city]["phase"]
            # Use per-city deterministic rng when available
            rng = self.city_states.get(city, {}).get('rng', random)

            if current_phase in ["growth", "peak"]:
                # Larger turbidity jumps during outbreak growth/peak
                new_row['turbidity_NTU'] = new_row.get('turbidity_NTU', 0) + rng.uniform(3.0, 10.0)
                new_row['rainfall_index'] = min(1.0, new_row.get('rainfall_index', 0) + rng.uniform(0.1, 0.3))
            else:
                new_row['turbidity_NTU'] = max(0.1, new_row.get('turbidity_NTU', 0) - rng.uniform(0.1, 0.5))
                new_row['rainfall_index'] = max(0.0, new_row.get('rainfall_index', 0) - rng.uniform(0.01, 0.05))

            turbidity = new_row['turbidity_NTU']
            fecal = new_row['fecal_coliform_cfu_100ml']
            ph = new_row['water_pH']
            new_row['water_contamination_index'] = (0.4 * turbidity) + (0.4 * fecal) + (0.2 * abs(7 - ph))
            new_row['humidity_index'] = new_row['water_temp_C'] / max_temp
            new_row['environmental_risk_index'] = (new_row['humidity_index'] * 0.5 + new_row['rainfall_index'] * 0.5)
            
            new_rows.append(new_row)

        new_day_df = pd.DataFrame(new_rows)
        df_extended = pd.concat([df, new_day_df], ignore_index=True)
        
        for city in df_extended['city'].unique():
            city_mask = df_extended['city'] == city
            city_indices = df_extended[city_mask].index.tolist()
            if len(city_indices) >= 2:
                last_idx = city_indices[-1]
                prev_idx = city_indices[-2]
                
                # Update rolling stats for the new row
                recent_admissions = df_extended.loc[city_indices[-3:], 'admissions'] if len(city_indices) >= 3 else df_extended.loc[city_indices, 'admissions']
                df_extended.at[last_idx, 'rolling_cases_72h'] = recent_admissions.mean()
                df_extended.at[last_idx, 'rolling_cases_24h'] = df_extended.at[last_idx, 'admissions']
                df_extended.at[last_idx, 'delta_cases'] = df_extended.at[last_idx, 'admissions'] - df_extended.at[prev_idx, 'admissions']
                df_extended.at[last_idx, 'case_growth_rate'] = df_extended.at[last_idx, 'delta_cases'] / max(1, df_extended.at[prev_idx, 'admissions'])

        latest_mask = df_extended['date'] == next_date

        # --- LIVE POD DATA INGESTION ---
        try:
            pod_df = pd.read_csv("backend/data/live_pod.csv")
            if not pod_df.empty:
                latest_pod = pod_df.tail(1)
                
                df_extended.loc[latest_mask, 'humidity_index'] = latest_pod["humidity"].values[0] / 100
                df_extended.loc[latest_mask, 'rainfall_index'] = latest_pod["rainfall"].values[0] / 10
                
                # Recalculate environmental_risk_index with live pod data
                df_extended.loc[latest_mask, 'environmental_risk_index'] = (
                    df_extended.loc[latest_mask, 'humidity_index'] * 0.5 + 
                    df_extended.loc[latest_mask, 'rainfall_index'] * 0.5
                )
        except:
            # Fallback if pod not connected
            pass

        if self.rf and self.scaler:
            features_to_normalize = [
                'rolling_cases_24h', 'rolling_cases_72h', 'delta_cases', 'case_growth_rate',
                'water_contamination_index', 'humidity_index', 'rainfall_index', 'environmental_risk_index',
                'bed_occupancy_rate'
            ]
            
            norm_data = self.scaler.transform(df_extended.loc[latest_mask, features_to_normalize])
            df_norm_latest = pd.DataFrame(norm_data, columns=features_to_normalize, index=df_extended[latest_mask].index)
            
            X_cols = ['rolling_cases_72h', 'water_contamination_index', 'humidity_index', 'rainfall_index', 'bed_occupancy_rate']
            df_extended.loc[latest_mask, 'predicted_cases_48h'] = self.rf.predict(df_norm_latest[X_cols])
            
            if self.iso_forest:
                ano_input = pd.DataFrame(index=df_extended[latest_mask].index)
                ano_input['admissions'] = df_extended.loc[latest_mask, 'admissions']
                ano_input['water_contamination_index'] = df_norm_latest['water_contamination_index']
                ano_input['case_growth_rate'] = df_norm_latest['case_growth_rate']
                ano_input = ano_input[['admissions', 'water_contamination_index', 'case_growth_rate']]
                df_extended.loc[latest_mask, 'anomaly_val'] = self.iso_forest.predict(ano_input)
                df_extended.loc[latest_mask, 'is_anomaly'] = df_extended.loc[latest_mask, 'anomaly_val'] == -1

        for idx in df_extended[latest_mask].index:
            norm_wci = df_norm_latest.at[idx, 'water_contamination_index']
            norm_hum = df_norm_latest.at[idx, 'humidity_index']
            norm_rain = df_norm_latest.at[idx, 'rainfall_index']
            
            raw_score = (
                0.4 * df_extended.at[idx, 'predicted_cases_48h'] +
                0.3 * (norm_wci * 100) +
                0.2 * (norm_hum * 100) +
                0.1 * (norm_rain * 100)
            )
            df_extended.at[idx, 'raw_risk_score'] = raw_score
            
        if self.risk_scaler:
            df_extended.loc[latest_mask, 'riskScore'] = self.risk_scaler.transform(df_extended.loc[latest_mask, ['raw_risk_score']])
            
        def classify_risk(score):
            if score >= 85: return 'Critical'
            if score >= 70: return 'High'
            if score >= 60: return 'High-Mod'
            if score >= 45: return 'Moderate'
            if score >= 30: return 'Low-Mod'
            if score >= 15: return 'Low'
            return 'Very Low'
        
        # --- Deterministic boosting logic to ensure some persistent critical/high zones ---
        try:
            import hashlib

            # Determine top-3 VIP cities deterministically by hash to promote to critical occasionally
            cities_latest = list(df_extended.loc[latest_mask, 'city'].unique())
            if cities_latest:
                # Deterministically order cities by hash to create a stable ordering
                city_hashes = [(c, int(hashlib.md5(c.encode('utf-8')).hexdigest(), 16)) for c in cities_latest]
                ordered = [c for c, _ in sorted(city_hashes, key=lambda x: x[1], reverse=True)]
                # Rotate selection window each day using next_date to compute offset
                num = len(ordered)
                start = (next_date.toordinal() if 'next_date' in locals() else pd.Timestamp.now().toordinal()) % num
                window = 3
                vip_cities = [ordered[(start + i) % num] for i in range(min(window, num))]
            else:
                vip_cities = []

            for idx in df_extended.loc[latest_mask].index:
                city = df_extended.at[idx, 'city']
                base_score = float(df_extended.at[idx, 'riskScore']) if pd.notna(df_extended.at[idx, 'riskScore']) else 0.0

                # Phase-based boost (use per-city state if available)
                phase = self.city_states.get(city, {}).get('phase') if city in self.city_states else None
                boost = 0.0
                if phase == 'peak':
                    boost += 30.0
                elif phase == 'growth':
                    boost += 15.0

                # VIP city deterministic boost to ensure 2-3 critical zones
                if city in vip_cities:
                    boost += 25.0

                new_score = min(100.0, base_score + boost)
                # Ensure risk is at least 60 for intended targets
                if city in vip_cities and new_score < 85:
                    new_score = max(new_score, 88.0)

                df_extended.at[idx, 'riskScore'] = new_score

        except Exception:
            pass

        df_extended.loc[latest_mask, 'riskLevel'] = df_extended.loc[latest_mask, 'riskScore'].apply(classify_risk)

        # 6. Memory Update
        data_loader.data["merged"] = df_extended
        data_loader.data["risk_scores"] = df_extended[['city', 'date', 'riskScore', 'riskLevel']]
        data_loader.data["predictions"] = df_extended[['city', 'date', 'predicted_cases_48h']]
        data_loader.data["anomalies"] = df_extended[['city', 'date', 'is_anomaly', 'anomaly_score']]
        
        zones_df = data_loader.data.get("zones")
        if zones_df is not None and not zones_df.empty:
            for z_idx, z_row in zones_df.iterrows():
                zone_city = z_row['zone_id']
                city_data = df_extended[(df_extended['city'] == zone_city) & (df_extended['date'] == next_date)]
                if not city_data.empty:
                    zones_df.at[z_idx, 'avg_risk'] = float(city_data['riskScore'].iloc[0])
            data_loader.data["zones"] = zones_df

        data_loader.last_loaded = datetime.now()
        
        print(f"Time Advanced: Simulation is now at {next_date.strftime('%Y-%m-%d')}")
        
        return {"status": "simulation updated", "count": len(new_rows), "current_date": next_date.strftime('%Y-%m-%d')}

simulation_service = SimulationService()
