from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from routes import ingest, dashboard, map, alerts, prediction, system, demo, scenario
from database import engine, Base

# Initialize Database
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="VectorShield API",
    description="Intelligent Outbreak Prediction & Geographic Risk Management System",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root Health Check
@app.get("/")
def read_root():
    return {"status": "VectorShield Backend API Running", "version": "v1"}

# Versioning Prefix /api/v1/
API_PREFIX = "/api/v1"

app.include_router(dashboard.router, prefix=f"{API_PREFIX}/dashboard", tags=["Dashboard"])
app.include_router(map.router, prefix=f"{API_PREFIX}/map", tags=["Geospatial"])
app.include_router(alerts.router, prefix=f"{API_PREFIX}/alerts", tags=["Alerts"])
app.include_router(prediction.router, prefix=f"{API_PREFIX}/prediction", tags=["ML Predictions"])
app.include_router(ingest.router, prefix=f"{API_PREFIX}/ingest", tags=["Data Ingestion"])
app.include_router(system.router, prefix=f"{API_PREFIX}/system", tags=["System Maintenance"])
app.include_router(demo.router, prefix=f"{API_PREFIX}/demo", tags=["Demo Mode"])
app.include_router(scenario.router, prefix=f"{API_PREFIX}/scenario", tags=["Scenario Workshop"])

@app.post(f"{API_PREFIX}/simulate-tick")
def simulate_tick():
    from services.simulation_service import simulation_service
    return simulation_service.simulate_tick()
