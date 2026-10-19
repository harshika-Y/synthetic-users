from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.seed import seed_database
from app.api import (
    auth, products, personas, experiments, surveys,
    interviews, insights, adoption, validation, scenarios,
    reports, settings as api_settings
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize and seed database on startup
    try:
        seed_database()
    except Exception as e:
        print(f"Database seed notice: {e}")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI-Powered Synthetic User Research & Product Validation Platform",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(personas.router, prefix="/api")
app.include_router(experiments.router, prefix="/api")
app.include_router(surveys.router, prefix="/api")
app.include_router(interviews.router, prefix="/api")
app.include_router(insights.router, prefix="/api")
app.include_router(adoption.router, prefix="/api")
app.include_router(validation.router, prefix="/api")
app.include_router(scenarios.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(api_settings.router, prefix="/api")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "mode": "Live AI" if not settings.DEMO_MODE and settings.GROQ_API_KEY else "High-Fidelity Simulation (Demo Mode)",
        "database": "MySQL" if "mysql" in settings.DATABASE_URL else "SQLite (Local Auto-Fallback)",
        "llm_provider": "Groq",
        "model": settings.GROQ_MODEL
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
