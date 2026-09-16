from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import sys
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Detect environment
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
IS_PRODUCTION = ENVIRONMENT == "production"

try:
    from routes import ingest, dashboard, map, alerts, prediction, system, demo, scenario, inventory, auth as auth_routes, admin as admin_routes
    from database import engine, Base
    import db_models  # noqa: F401 - registers Hospital table with Base.metadata
    from auth import get_current_hospital, get_current_admin, seed_admin_account, seed_demo_tenants
    logger.info("Routes imported successfully")
except Exception as e:
    logger.error(f"Error importing routes: {e}", exc_info=True)
    raise

# Initialize Database
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database initialized successfully")
    seed_admin_account()
    seed_demo_tenants()
    logger.info("Admin account and demo tenants verified")
except Exception as e:
    logger.error(f"Error initializing database: {e}", exc_info=True)

app = FastAPI(
    title="VectorShield API",
    description="Intelligent Outbreak Prediction & Geographic Risk Management System",
    version="1.0.0",
)

# Enable CORS with proper headers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    print("VectorShield backend started on localhost")
    logger.info("VectorShield backend started on localhost")

# Root Health Check
@app.get("/")
def read_root():
    return {
        "status": "VectorShield Backend API Running",
        "version": "v1",
        "environment": ENVIRONMENT
    }

# Versioning Prefix /api/v1/
API_PREFIX = "/api/v1"

try:
    app.include_router(auth_routes.router, prefix=f"{API_PREFIX}/auth", tags=["Auth"])
    app.include_router(admin_routes.router, prefix=f"{API_PREFIX}/admin", tags=["Admin"], dependencies=[Depends(get_current_admin)])

    protected = [Depends(get_current_hospital)]
    app.include_router(dashboard.router, prefix=f"{API_PREFIX}/dashboard", tags=["Dashboard"], dependencies=protected)
    app.include_router(map.router, prefix=f"{API_PREFIX}/map", tags=["Geospatial"], dependencies=protected)
    app.include_router(alerts.router, prefix=f"{API_PREFIX}/alerts", tags=["Alerts"], dependencies=protected)
    app.include_router(prediction.router, prefix=f"{API_PREFIX}/prediction", tags=["ML Predictions"], dependencies=protected)
    app.include_router(ingest.router, prefix=f"{API_PREFIX}/ingest", tags=["Data Ingestion"], dependencies=protected)
    app.include_router(system.router, prefix=f"{API_PREFIX}/system", tags=["System Maintenance"], dependencies=protected)
    app.include_router(demo.router, prefix=f"{API_PREFIX}/demo", tags=["Demo Mode"], dependencies=protected)
    app.include_router(scenario.router, prefix=f"{API_PREFIX}/scenario", tags=["Scenario Workshop"], dependencies=protected)
    app.include_router(inventory.router, prefix=f"{API_PREFIX}/inventory", tags=["Inventory Intelligence"], dependencies=protected)
    logger.info("All routers included successfully")
except Exception as e:
    logger.error(f"Error including routers: {e}", exc_info=True)

@app.post(f"{API_PREFIX}/simulate-tick", dependencies=[Depends(get_current_hospital)])
def simulate_tick():
    try:
        from services.simulation_service import simulation_service
        return simulation_service.simulate_tick()
    except Exception as e:
        logger.error(f"Error in simulate_tick: {e}", exc_info=True)
        return {"error": str(e)}, 500

# Error handlers
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global exception: {exc}", exc_info=True)
    return {
        "error": "Internal server error",
        "detail": str(exc) if not IS_PRODUCTION else "An error occurred"
    }, 500
