from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

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

PLAN_CHOICES = ("starter", "professional", "enterprise")

class HospitalSignup(BaseModel):
    hospital_name: str
    email: str
    password: str
    plan: str
    hospital_count: int = 1

class HospitalLogin(BaseModel):
    email: str
    password: str

class HospitalOut(BaseModel):
    id: int
    hospital_name: str
    email: str
    status: str
    plan: Optional[str] = None
    hospital_count: Optional[int] = None
    is_admin: bool
    dataset_profile: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    hospital: HospitalOut

class SignupResponse(BaseModel):
    status: str
    message: str
    hospital: HospitalOut

class ApprovalUpdate(BaseModel):
    plan: Optional[str] = None
    hospital_count: Optional[int] = None

class TenantOverview(BaseModel):
    id: int
    hospital_name: str
    email: str
    status: str
    plan: Optional[str] = None
    hospital_count: Optional[int] = None
    dataset_profile: str
    created_at: Optional[datetime] = None
    citiesMonitored: int
    criticalZones: int
    highZones: int
    avgRisk: float
    totalAnomalies: int
    totalPredictedCases: float

class AdminOverview(BaseModel):
    totalTenants: int
    pendingCount: int
    approvedCount: int
    rejectedCount: int
    totalFacilitiesMonitored: int
    tenants: List[TenantOverview]

class InventoryStatusItem(BaseModel):
    hospital_id: str
    hospital_name: str
    city: str
    item_code: str
    item_name: str
    unit: str
    current_stock: int
    projected_demand_48h: float
    daily_burn_rate: float
    days_of_cover: float
    lead_time_days: int
    recommended_reorder_qty: int
    unit_cost_inr: float
    urgency: str

class InventorySummary(BaseModel):
    criticalItems: int
    warningItems: int
    hospitalsAtRisk: int
    estimatedReorderSpendInr: float
    totalItemsTracked: int

class RebalanceSuggestion(BaseModel):
    item_code: str
    item_name: str
    unit: str
    from_hospital_id: str
    from_hospital_name: str
    from_city: str
    to_hospital_id: str
    to_hospital_name: str
    to_city: str
    quantity: int
    distance_km: Optional[float] = None
    to_urgency: str
