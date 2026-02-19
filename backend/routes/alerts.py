from fastapi import APIRouter
from typing import List
from services.alert_engine import alert_engine
from schemas import Alert

router = APIRouter()

@router.get("/live", response_model=List[Alert])
def get_alerts_live():
    return alert_engine.generate_alerts()
