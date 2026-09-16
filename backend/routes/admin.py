from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth import get_db
from db_models import Hospital
from schemas import HospitalOut, ApprovalUpdate, PLAN_CHOICES, AdminOverview, TenantOverview
from services.data_loader import data_loader

router = APIRouter()


@router.get("/hospitals", response_model=List[HospitalOut])
def list_hospitals(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Hospital).filter(Hospital.is_admin == False)  # noqa: E712
    if status:
        query = query.filter(Hospital.status == status)
    return query.order_by(Hospital.created_at.desc()).all()


@router.get("/overview", response_model=AdminOverview)
def get_overview(db: Session = Depends(get_db)):
    """Cross-tenant summary for the admin's own control dashboard."""
    all_tenants = (
        db.query(Hospital)
        .filter(Hospital.is_admin == False)  # noqa: E712
        .order_by(Hospital.created_at.desc())
        .all()
    )

    risk_df = data_loader.get_latest_risk_scores()
    anomaly_df = data_loader.get_latest_anomalies()
    preds_df = data_loader.get_latest_predictions()

    tenant_rows = []
    for hospital in all_tenants:
        if hospital.status != "approved":
            continue  # only approved tenants have a live dashboard to snapshot

        tenant_cities = data_loader.get_tenant_cities(hospital.dataset_profile)

        scoped_risk = risk_df[risk_df['city'].isin(tenant_cities)] if not risk_df.empty else risk_df
        scoped_anomaly = anomaly_df[anomaly_df['city'].isin(tenant_cities)] if not anomaly_df.empty else anomaly_df
        scoped_preds = preds_df[preds_df['city'].isin(tenant_cities)] if not preds_df.empty else preds_df

        if scoped_risk is not None and not scoped_risk.empty:
            cities_monitored = len(scoped_risk['city'].unique())
            critical_zones = len(scoped_risk[scoped_risk['riskLevel'] == 'Critical'])
            high_zones = len(scoped_risk[scoped_risk['riskLevel'] == 'High'])
            avg_risk = round(float(scoped_risk['riskScore'].mean()), 2)
        else:
            cities_monitored = 0
            critical_zones = 0
            high_zones = 0
            avg_risk = 0.0

        total_anomalies = (
            int(scoped_anomaly[scoped_anomaly['is_anomaly'] == True].shape[0])  # noqa: E712
            if scoped_anomaly is not None and not scoped_anomaly.empty
            else 0
        )
        total_predicted_cases = (
            round(float(scoped_preds['predicted_cases_48h'].sum()), 2)
            if scoped_preds is not None and not scoped_preds.empty
            else 0.0
        )

        tenant_rows.append(
            TenantOverview(
                id=hospital.id,
                hospital_name=hospital.hospital_name,
                email=hospital.email,
                status=hospital.status,
                plan=hospital.plan,
                hospital_count=hospital.hospital_count,
                dataset_profile=hospital.dataset_profile,
                created_at=hospital.created_at,
                citiesMonitored=cities_monitored,
                criticalZones=critical_zones,
                highZones=high_zones,
                avgRisk=avg_risk,
                totalAnomalies=total_anomalies,
                totalPredictedCases=total_predicted_cases,
            )
        )

    return AdminOverview(
        totalTenants=len(all_tenants),
        pendingCount=sum(1 for h in all_tenants if h.status == "pending"),
        approvedCount=sum(1 for h in all_tenants if h.status == "approved"),
        rejectedCount=sum(1 for h in all_tenants if h.status == "rejected"),
        totalFacilitiesMonitored=sum(h.hospital_count or 0 for h in all_tenants if h.status == "approved"),
        tenants=tenant_rows,
    )


@router.post("/hospitals/{hospital_id}/approve", response_model=HospitalOut)
def approve_hospital(
    hospital_id: int,
    payload: ApprovalUpdate = ApprovalUpdate(),
    db: Session = Depends(get_db),
):
    hospital = db.query(Hospital).filter(Hospital.id == hospital_id, Hospital.is_admin == False).first()  # noqa: E712
    if hospital is None:
        raise HTTPException(status_code=404, detail="Hospital not found")

    if payload.plan is not None:
        if payload.plan not in PLAN_CHOICES:
            raise HTTPException(status_code=400, detail=f"Plan must be one of: {', '.join(PLAN_CHOICES)}")
        hospital.plan = payload.plan
    if payload.hospital_count is not None:
        if payload.hospital_count < 1:
            raise HTTPException(status_code=400, detail="Hospital count must be at least 1")
        hospital.hospital_count = payload.hospital_count

    hospital.status = "approved"
    hospital.reviewed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(hospital)
    return hospital


@router.post("/hospitals/{hospital_id}/reject", response_model=HospitalOut)
def reject_hospital(
    hospital_id: int,
    db: Session = Depends(get_db),
):
    hospital = db.query(Hospital).filter(Hospital.id == hospital_id, Hospital.is_admin == False).first()  # noqa: E712
    if hospital is None:
        raise HTTPException(status_code=404, detail="Hospital not found")

    hospital.status = "rejected"
    hospital.reviewed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(hospital)
    return hospital
