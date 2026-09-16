import pandas as pd
import os
from datetime import datetime

class DataLoader:
    def __init__(self, output_dir="ml_outputs"):
        self.output_dir = output_dir
        self.data = {}
        self.last_loaded = None
        self.load_data()

    def load_data(self):
        print(f"Loading ML outputs from {self.output_dir}...")
        files = {
            "merged": "merged_features.csv",
            "predictions": "predictions.csv",
            "risk_scores": "riskScores.csv",
            "anomalies": "anomalies.csv",
            "zones": "zones.csv"
        }

        for key, filename in files.items():
            path = os.path.join(self.output_dir, filename)
            if os.path.exists(path):
                df = pd.read_csv(path)
                # Convert date column to datetime if exists
                if 'date' in df.columns:
                    df['date'] = pd.to_datetime(df['date'])
                self.data[key] = df
            else:
                print(f"Warning: {path} not found.")
                self.data[key] = pd.DataFrame()

        self._tenant_cities_cache = {}
        self.last_loaded = datetime.now()
        print("Data loaded successfully.")

    def get_tenant_cities(self, profile: str):
        """City names belonging to a given dataset_profile (see db_models.Hospital).
        Cached per profile since the merged dataframe -> profile mapping never
        changes at runtime (only which cities exist, not who they belong to)."""
        if not hasattr(self, '_tenant_cities_cache'):
            self._tenant_cities_cache = {}
        if profile in self._tenant_cities_cache:
            return self._tenant_cities_cache[profile]

        merged = self.data.get("merged")
        if merged is None or merged.empty or 'tenant_profile' not in merged.columns:
            # No tenant tagging present (e.g. dataset hasn't been regenerated with
            # scripts/generate_demo_tenant_data.py) - everyone sees everything.
            cities = set(merged['city'].unique()) if merged is not None and not merged.empty else set()
        else:
            cities = set(merged.loc[merged['tenant_profile'] == profile, 'city'].unique())

        self._tenant_cities_cache[profile] = cities
        return cities

    def get_latest_risk_scores(self):
        df = self.data.get("risk_scores")
        if df.empty: return df
        # Get the most recent date
        latest_date = df['date'].max()
        return df[df['date'] == latest_date]

    def get_latest_predictions(self):
        df = self.data.get("predictions")
        if df.empty: return df
        latest_date = df['date'].max()
        return df[df['date'] == latest_date]

    def get_latest_anomalies(self):
        df = self.data.get("anomalies")
        if df.empty: return df
        latest_date = df['date'].max()
        return df[df['date'] == latest_date]

    def get_zones(self):
        return self.data.get("zones", pd.DataFrame())

    def get_merged(self):
        return self.data.get("merged", pd.DataFrame())

# Global singleton instance
data_loader = DataLoader(output_dir=os.path.join(os.path.dirname(os.path.dirname(__file__)), "ml_outputs"))
