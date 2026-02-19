from fastapi import APIRouter
from services.simulation_service import simulation_service
from schemas import RiskExplanation, CorrelationData
import random

router = APIRouter()

@router.post("/start")
async def start_demo():
    await simulation_service.start()
    return {"status": "Demo simulation started", "city": simulation_service.target_city}

@router.post("/stop")
async def stop_demo():
    await simulation_service.stop()
    return {"status": "Demo simulation stopped"}

@router.post("/simulate-tick")
def simulate_tick():
    result = simulation_service.simulate_tick()
    return result

@router.get("/explanation/{location}", response_model=RiskExplanation)
def get_risk_explanation(location: str):
    # Dynamic values based on simulated or actual risk
    # In a real app, these would be derived from the ML feature weights
    return {
        "location": location,
        "hospitalTrend": round(random.uniform(5.0, 15.0), 2),
        "waterContamination": round(random.uniform(30.0, 80.0), 2),
        "environmentalRisk": round(random.uniform(20.0, 60.0), 2),
        "confidence": 94.2
    }

@router.get("/correlations", response_model=CorrelationData)
def get_correlations():
    return {
        "casesVsWater": 0.82,
        "casesVsHumidity": 0.45,
        "casesVsRainfall": 0.61
    }
