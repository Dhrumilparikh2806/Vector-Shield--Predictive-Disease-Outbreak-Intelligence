from datetime import datetime
from .data_loader import data_loader

class AlertEngine:
    def generate_alerts(self):
        risk_df = data_loader.get_latest_risk_scores()
        anomaly_df = data_loader.get_latest_anomalies()
        
        if risk_df.empty or anomaly_df.empty:
            return []

        # Merge risk and anomalies to check both conditions easily
        merged = risk_df.merge(anomaly_df, on=['city', 'date'], how='inner')
        
        alerts = []
        for _, row in merged.iterrows():
            risk_score = row.get('riskScore', 0)
            is_anomaly = row.get('is_anomaly', False)
            
            if risk_score > 70 or is_anomaly:
                severity = "Low"
                message = ""
                
                if risk_score >= 85:
                    severity = "Critical"
                    message = f"Critical risk detected in {row['city']}. Immediate action required."
                elif risk_score >= 70:
                    severity = "High"
                    message = f"High risk alert for {row['city']}. Monitor status closely."
                elif is_anomaly:
                    severity = "Moderate"
                    message = f"Statistical anomaly detected in {row['city']} admissions data."
                
                alerts.append({
                    "location": row['city'],
                    "severity": severity,
                    "message": message,
                    "timestamp": row['date'].strftime("%Y-%m-%d")
                })
        
        return alerts

alert_engine = AlertEngine()
