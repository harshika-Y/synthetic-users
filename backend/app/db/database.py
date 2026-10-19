import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

db_url = settings.DATABASE_URL
connect_args = {}

# Ensure SQLite URL resolves properly across working directories
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    if "regalux.db" in db_url and not os.path.isabs(db_url.replace("sqlite:///", "")):
        root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
        root_db = os.path.join(root_dir, "regalux.db")
        if os.path.exists(root_db):
            db_url = f"sqlite:///{root_db}"

try:
    engine = create_engine(db_url, connect_args=connect_args)
    # Test connection
    with engine.connect() as conn:
        pass
except Exception as e:
    logger.warning(f"Could not connect to {db_url} ({e}). Falling back to local SQLite: sqlite:///./regalux.db")
    db_url = "sqlite:///./regalux.db"
    connect_args = {"check_same_thread": False}
    engine = create_engine(db_url, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
