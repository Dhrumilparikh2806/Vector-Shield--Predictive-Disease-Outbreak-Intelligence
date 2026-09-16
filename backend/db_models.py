from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func

from database import Base


class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True)
    hospital_name = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    status = Column(String, nullable=False, default="pending")  # pending | approved | rejected
    plan = Column(String, nullable=True)  # starter | professional | enterprise
    hospital_count = Column(Integer, nullable=True, default=1)  # how many hospitals/facilities to monitor
    is_admin = Column(Boolean, nullable=False, default=False)

    # Which slice of the surveillance dataset this account sees.
    # 'default' = the original shared pilot dataset every normal signup gets.
    # 'government' / 'meridian' / 'ramdayal' = the three investor-demo tenants,
    # each scoped to its own fabricated set of cities/branches (see geo_mapping.py
    # and scripts/generate_demo_tenant_data.py).
    dataset_profile = Column(String, nullable=False, default="default")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
