from fastapi import APIRouter
from services.data_loader import data_loader
from services.simulation_service import simulation_service
from schemas import SystemStatus

router = APIRouter()

@router.post("/reload", response_model=SystemStatus)
def reload_data():
    data_loader.load_data()
    return {
        "status": "Success: Data reloaded from ml_outputs",
        "last_load": data_loader.last_loaded.strftime("%Y-%m-%d %H:%M:%S")
    }

@router.get("/sim-state")
def sim_state():
    # expose per-city deterministic simulation state for debugging
    states = {}
    for city, st in getattr(simulation_service, 'city_states', {}).items():
        states[city] = {
            'phase': st.get('phase'),
            'step': st.get('step'),
            'duration': st.get('duration')
        }
    return states
