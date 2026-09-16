from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth import create_access_token, get_current_hospital, get_db, hash_password, verify_password
from db_models import Hospital
from schemas import HospitalLogin, HospitalSignup, Token, HospitalOut, SignupResponse, PLAN_CHOICES

router = APIRouter()


@router.post("/signup", response_model=SignupResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: HospitalSignup, db: Session = Depends(get_db)):
    hospital_name = payload.hospital_name.strip()
    email = payload.email.strip().lower()

    if not hospital_name or not email or not payload.password:
        raise HTTPException(status_code=400, detail="Hospital name, email, and password are required")
    if len(payload.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    if payload.plan not in PLAN_CHOICES:
        raise HTTPException(status_code=400, detail=f"Plan must be one of: {', '.join(PLAN_CHOICES)}")
    if payload.hospital_count < 1:
        raise HTTPException(status_code=400, detail="Hospital count must be at least 1")

    existing = db.query(Hospital).filter(
        (Hospital.email == email) | (Hospital.hospital_name == hospital_name)
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="A hospital with that name or email already exists")

    hospital = Hospital(
        hospital_name=hospital_name,
        email=email,
        hashed_password=hash_password(payload.password),
        status="pending",
        plan=payload.plan,
        hospital_count=payload.hospital_count,
        is_admin=False,
    )
    db.add(hospital)
    db.commit()
    db.refresh(hospital)

    return SignupResponse(
        status="pending",
        message="Your hospital has been registered and is awaiting administrator approval. You'll be able to sign in once approved.",
        hospital=hospital,
    )


@router.post("/login", response_model=Token)
def login(payload: HospitalLogin, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    hospital = db.query(Hospital).filter(Hospital.email == email).first()

    if hospital is None or not verify_password(payload.password, hospital.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not hospital.is_admin:
        if hospital.status == "pending":
            raise HTTPException(status_code=403, detail="Your registration is still pending administrator approval.")
        if hospital.status == "rejected":
            raise HTTPException(status_code=403, detail="Your registration was not approved. Contact the administrator.")

    token = create_access_token(hospital.id)
    return Token(access_token=token, hospital=hospital)


@router.get("/me", response_model=HospitalOut)
def me(current_hospital: Hospital = Depends(get_current_hospital)):
    return current_hospital
