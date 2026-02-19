from pydantic import BaseModel
from typing import List, Optional

class RiskZone(BaseModel):
    location: str
    lat: float
    lng: float
    riskScore: float
    riskLevel: str

class Prediction(BaseModel):
    location: str
    predicted_cases_48h: float

class Alert(BaseModel):
    location: str
    severity: str
    message: str
    timestamp: str

class DashboardSummary(BaseModel):
    totalZones: int
    criticalZones: int
    highZones: int
    avgRisk: float
    totalAnomalies: int
    totalPredictedCases: float

class SystemStatus(BaseModel):
    status: str
    last_load: str

class RiskExplanation(BaseModel):
    location: str
    hospitalTrend: float
    waterContamination: float
    environmentalRisk: float
    confidence: float

class CorrelationData(BaseModel):
    casesVsWater: float
    casesVsHumidity: float
    casesVsRainfall: float
