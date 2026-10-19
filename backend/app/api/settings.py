from fastapi import APIRouter, Depends
from app.core.config import settings
from app.schemas.schemas import SettingsOut, SettingsUpdate
from app.services.llm_service import llm_service
from app.api.deps import get_current_user
from app.models.models import User

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("", response_model=SettingsOut)
def get_settings(current_user: User = Depends(get_current_user)):
    return {
        "groq_api_key_configured": bool(settings.GROQ_API_KEY),
        "groq_model": settings.GROQ_MODEL,
        "openai_api_key_configured": bool(settings.OPENAI_API_KEY),
        "openai_model": settings.OPENAI_MODEL,
        "ai_provider": settings.AI_PROVIDER,
        "demo_mode": settings.DEMO_MODE,
        "database_url": "MySQL (Production Engine)" if "mysql" in settings.DATABASE_URL else "SQLite (Local Auto-Fallback)"
    }

@router.post("", response_model=SettingsOut)
def update_settings(update_data: SettingsUpdate, current_user: User = Depends(get_current_user)):
    if update_data.openai_api_key is not None:
        settings.OPENAI_API_KEY = update_data.openai_api_key.strip()
        if settings.OPENAI_API_KEY:
            settings.DEMO_MODE = False

    if update_data.openai_model is not None:
        settings.OPENAI_MODEL = update_data.openai_model.strip()

    if update_data.groq_api_key is not None:
        settings.GROQ_API_KEY = update_data.groq_api_key.strip()
        if settings.GROQ_API_KEY:
            settings.DEMO_MODE = False

    if update_data.groq_model is not None:
        settings.GROQ_MODEL = update_data.groq_model.strip()

    if update_data.ai_provider is not None:
        settings.AI_PROVIDER = update_data.ai_provider.strip()

    if update_data.demo_mode is not None:
        settings.DEMO_MODE = update_data.demo_mode

    # Re-initialize all LLM clients
    llm_service.reinit()

    return {
        "groq_api_key_configured": bool(settings.GROQ_API_KEY),
        "groq_model": settings.GROQ_MODEL,
        "openai_api_key_configured": bool(settings.OPENAI_API_KEY),
        "openai_model": settings.OPENAI_MODEL,
        "ai_provider": settings.AI_PROVIDER,
        "demo_mode": settings.DEMO_MODE,
        "database_url": "MySQL (Production Engine)" if "mysql" in settings.DATABASE_URL else "SQLite (Local Auto-Fallback)"
    }
