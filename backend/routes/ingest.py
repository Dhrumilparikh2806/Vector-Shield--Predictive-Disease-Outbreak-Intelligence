from fastapi import APIRouter

router = APIRouter()

@router.post("/ingest/hospital")
def ingest_hospital():
    return {"status": "received"}

@router.post("/ingest/water")
def ingest_water():
    return {"status": "received"}

@router.post("/ingest/pod")
def ingest_pod():
    return {"status": "received"}
