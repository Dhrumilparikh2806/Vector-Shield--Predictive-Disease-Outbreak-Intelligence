from fastapi import APIRouter, Depends
from typing import List
from services.data_loader import data_loader
from schemas import Prediction

from auth import get_current_hospital
from db_models import Hospital

router = APIRouter()

@router.get("/48h", response_model=List[Prediction])
def get_prediction_48h(current_hospital: Hospital = Depends(get_current_hospital)):
    tenant_cities = data_loader.get_tenant_cities(current_hospital.dataset_profile)
    preds_df = data_loader.get_latest_predictions()

    if preds_df.empty:
        return []

    preds_df = preds_df[preds_df['city'].isin(tenant_cities)]

    predictions = []
    for _, row in preds_df.iterrows():
        predictions.append({
            "location": row['city'],
            "predicted_cases_48h": row['predicted_cases_48h']
        })
    return predictions
