import os
from typing import List
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "REGALUX AI — Synthetic User Research Intelligence"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "regalux-royal-champagne-emerald-secret-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Primary DB configuration. If MySQL is configured in env, it uses it; otherwise SQLite fallback.
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./regalux.db")
    
    # LLM Settings
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "auto")  # "openai", "groq", or "auto"
    
    # Demo Mode: if True and no live key configured, our autonomous intelligence engine runs
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() in ("true", "1", "yes") if not (os.getenv("GROQ_API_KEY") or os.getenv("OPENAI_API_KEY")) else False

    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    REPORTS_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "generated_reports"))

settings = Settings()
os.makedirs(settings.REPORTS_DIR, exist_ok=True)
