from fastapi import APIRouter, Depends
from typing import List

from services.data_loader import data_loader
from services.inventory_engine import inventory_engine
from schemas import InventoryStatusItem, InventorySummary, RebalanceSuggestion

from auth import get_current_hospital
from db_models import Hospital

router = APIRouter()


@router.get("/status", response_model=List[InventoryStatusItem])
def get_inventory_status(current_hospital: Hospital = Depends(get_current_hospital)):
    tenant_cities = data_loader.get_tenant_cities(current_hospital.dataset_profile)
    return inventory_engine.get_status(tenant_cities)


@router.get("/summary", response_model=InventorySummary)
def get_inventory_summary(current_hospital: Hospital = Depends(get_current_hospital)):
    tenant_cities = data_loader.get_tenant_cities(current_hospital.dataset_profile)
    status_rows = inventory_engine.get_status(tenant_cities)
    return inventory_engine.get_summary(status_rows)


@router.get("/rebalance", response_model=List[RebalanceSuggestion])
def get_inventory_rebalance(current_hospital: Hospital = Depends(get_current_hospital)):
    tenant_cities = data_loader.get_tenant_cities(current_hospital.dataset_profile)
    return inventory_engine.get_rebalance_suggestions(tenant_cities)
