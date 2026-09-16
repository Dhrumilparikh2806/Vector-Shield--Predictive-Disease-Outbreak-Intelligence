import os
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from database import SessionLocal
from db_models import Hospital

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRES_DAYS = 7

bearer_scheme = HTTPBearer()


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed_password.encode("utf-8"))


def create_access_token(hospital_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRES_DAYS)
    payload = {"sub": str(hospital_id), "exp": expire}
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_hospital(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> Hospital:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        hospital_id = int(payload.get("sub"))
    except (jwt.PyJWTError, TypeError, ValueError):
        raise unauthorized

    hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if hospital is None:
        raise unauthorized
    return hospital


def get_current_admin(current_hospital: Hospital = Depends(get_current_hospital)) -> Hospital:
    if not current_hospital.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Administrator access required")
    return current_hospital


def seed_admin_account():
    """Create the master admin account on first startup if it doesn't exist yet."""
    admin_email = os.getenv("ADMIN_EMAIL", "admin@vectorshield.local").strip().lower()
    admin_password = os.getenv("ADMIN_PASSWORD", "VectorShieldAdmin!2026")

    db = SessionLocal()
    try:
        existing = db.query(Hospital).filter(Hospital.is_admin == True).first()  # noqa: E712
        if existing:
            return
        admin = Hospital(
            hospital_name="VectorShield Admin",
            email=admin_email,
            hashed_password=hash_password(admin_password),
            status="approved",
            plan=None,
            hospital_count=None,
            is_admin=True,
        )
        db.add(admin)
        db.commit()
    finally:
        db.close()


# Investor-demo tenants — each pre-approved and scoped to its own fabricated
# dataset (see geo_mapping.py + scripts/generate_demo_tenant_data.py).
# Credentials are intentionally fixed/simple: these are demo accounts, not
# real customer accounts.
DEMO_TENANTS = [
    {
        "hospital_name": "National Government Hospital Network",
        "email": "government@vectorshield.local",
        "password": "GovNetwork2026!",
        "plan": "enterprise",
        "hospital_count": 28,
        "dataset_profile": "government",
    },
    {
        "hospital_name": "Meridian Health Network",
        "email": "meridian@vectorshield.local",
        "password": "MeridianHealth2026!",
        "plan": "enterprise",
        "hospital_count": 100,
        "dataset_profile": "meridian",
    },
    {
        "hospital_name": "Ram Dayal Hospital",
        "email": "ramdayal@vectorshield.local",
        "password": "RamDayal2026!",
        "plan": "starter",
        "hospital_count": 1,
        "dataset_profile": "ramdayal",
    },
]


def seed_demo_tenants():
    """Create the three investor-demo tenant accounts if they don't exist yet."""
    db = SessionLocal()
    try:
        for tenant in DEMO_TENANTS:
            existing = db.query(Hospital).filter(Hospital.email == tenant["email"]).first()
            if existing:
                continue
            hospital = Hospital(
                hospital_name=tenant["hospital_name"],
                email=tenant["email"],
                hashed_password=hash_password(tenant["password"]),
                status="approved",
                plan=tenant["plan"],
                hospital_count=tenant["hospital_count"],
                is_admin=False,
                dataset_profile=tenant["dataset_profile"],
            )
            db.add(hospital)
        db.commit()
    finally:
        db.close()
