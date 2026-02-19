from fastapi import APIRouter
from services.data_loader import data_loader
from schemas import DashboardSummary
import pandas as pd
import os

# Resolve paths relative to this file so they work regardless of CWD
_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LIVE_POD_PATH = os.path.join(_BACKEND_DIR, "data", "live_pod.csv")

router = APIRouter()

@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary():
    risk_df = data_loader.get_latest_risk_scores()
    zones_df = data_loader.get_zones()
    anomaly_df = data_loader.get_latest_anomalies()
    preds_df = data_loader.get_latest_predictions()

    if risk_df.empty:
        return {
            "totalZones": 0,
            "criticalZones": 0,
            "highZones": 0,
            "avgRisk": 0.0,
            "totalAnomalies": 0,
            "totalPredictedCases": 0.0
        }

    total_zones = len(risk_df['city'].unique())
    critical_zones = len(risk_df[risk_df['riskLevel'] == 'Critical'])
    high_zones = len(risk_df[risk_df['riskLevel'] == 'High'])
    avg_risk = float(risk_df['riskScore'].mean())
    total_anomalies = int(anomaly_df[anomaly_df['is_anomaly'] == True].shape[0]) if not anomaly_df.empty else 0
    total_preds = float(preds_df['predicted_cases_48h'].sum()) if not preds_df.empty else 0.0

    return {
        "totalZones": total_zones,
        "criticalZones": critical_zones,
        "highZones": high_zones,
        "avgRisk": round(avg_risk, 2),
        "totalAnomalies": total_anomalies,
        "totalPredictedCases": round(total_preds, 2)
    }


@router.get("/live-pod-data")
def get_live_pod_data():
    """Get the latest sensor data from live_pod.csv"""
    try:
        pod_path = LIVE_POD_PATH
        if not os.path.exists(pod_path):
            return {
                "temperature": 0,
                "humidity": 0,
                "rainfall": 0,
                "soil_moisture": 0,
                "status": "no_data"
            }
        
        df = pd.read_csv(pod_path)
        if df.empty:
            return {
                "temperature": 0,
                "humidity": 0,
                "rainfall": 0,
                "soil_moisture": 0,
                "status": "no_data"
            }
        
        latest = df.iloc[-1]
        return {
            "temperature": round(float(latest.get("temperature", 0)), 1),
            "humidity": round(float(latest.get("humidity", 0)), 1),
            "rainfall": round(float(latest.get("rainfall", 0)), 2),
            "soil_moisture": round(float(latest.get("moisture", 0)), 1),
            "status": "live"
        }
    except Exception as e:
        print(f"Error reading live pod data: {e}")
        return {
            "temperature": 0,
            "humidity": 0,
            "rainfall": 0,
            "soil_moisture": 0,
            "status": "error"
        }
