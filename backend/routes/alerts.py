from fastapi import APIRouter, Depends
from typing import List
from services.alert_engine import alert_engine
from services.data_loader import data_loader
from schemas import Alert

from auth import get_current_hospital
from db_models import Hospital

router = APIRouter()

@router.get("/live", response_model=List[Alert])
def get_alerts_live(current_hospital: Hospital = Depends(get_current_hospital)):
    tenant_cities = data_loader.get_tenant_cities(current_hospital.dataset_profile)
    return alert_engine.generate_alerts(tenant_cities=tenant_cities)
