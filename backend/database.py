from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Support different database configurations via environment variable
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./vectorshield.db"
)

# For SQLite, add in-memory option for Vercel
if DATABASE_URL == "sqlite:///./vectorshield.db":
    # Try to use file-based, fall back to in-memory for serverless
    try:
        engine = create_engine(
            DATABASE_URL, 
            connect_args={"check_same_thread": False},
            pool_pre_ping=True
        )
    except:
        # Fallback to in-memory SQLite for Vercel
        engine = create_engine(
            "sqlite:///:memory:",
            connect_args={"check_same_thread": False},
            pool_pre_ping=True
        )
else:
    # Use cloud database (PostgreSQL, MySQL, etc.)
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
