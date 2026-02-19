from fastapi import APIRouter
from typing import List
from services.data_loader import data_loader
from schemas import Prediction

router = APIRouter()

@router.get("/48h", response_model=List[Prediction])
def get_prediction_48h():
    preds_df = data_loader.get_latest_predictions()
    
    if preds_df.empty:
        return []

    predictions = []
    for _, row in preds_df.iterrows():
        predictions.append({
            "location": row['city'],
            "predicted_cases_48h": row['predicted_cases_48h']
        })
    return predictions
