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
        
        self.last_loaded = datetime.now()
        print("Data loaded successfully.")

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
