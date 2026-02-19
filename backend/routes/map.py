from fastapi import APIRouter
from typing import List
from services.data_loader import data_loader
from schemas import RiskZone

router = APIRouter()

@router.get("/zones", response_model=List[RiskZone])
def get_map_zones():
    try:
        risk_df = data_loader.get_latest_risk_scores()
        merged_df = data_loader.get_merged()
        
        if risk_df.empty or merged_df.empty:
            print("Empty dataframes in get_map_zones")
            return []

        # Get geo data from merged features
        if 'lat' not in merged_df.columns or 'lng' not in merged_df.columns:
            print("Lat/Lng missing in merged_df")
            return []

        geo_data = merged_df[['city', 'lat', 'lng']].drop_duplicates()
        
        # Merge with latest risk scores
        result_df = risk_df.merge(geo_data, on='city', how='inner')
        
        zones = []
        for _, row in result_df.iterrows():
            zones.append({
                "location": row['city'],
                "lat": float(row['lat']),
                "lng": float(row['lng']),
                "riskScore": float(row['riskScore']),
                "riskLevel": str(row['riskLevel'])
            })
        return zones
    except Exception as e:
        print(f"Error in get_map_zones: {e}")
        import traceback
        traceback.print_exc()
        return []

@router.get("/heatmap")
def get_map_heatmap():
    try:
        risk_df = data_loader.get_latest_risk_scores()
        merged_df = data_loader.get_merged()
        
        if risk_df.empty or merged_df.empty:
            return []

        if 'lat' not in merged_df.columns or 'lng' not in merged_df.columns:
            return []

        geo_data = merged_df[['city', 'lat', 'lng']].drop_duplicates()
        result_df = risk_df.merge(geo_data, on='city', how='inner')
        
        heatmap_data = result_df[['lat', 'lng', 'riskScore']].fillna(0).values.tolist()
        return heatmap_data
    except Exception as e:
        print(f"Error in get_map_heatmap: {e}")
        return []
