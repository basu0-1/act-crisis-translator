"""
ACT (Actionable Crisis Translator) - FastAPI Main Application with Auth, RBAC & Database
"""
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.api import health, alerts, user, risk, route, plan, simulate, auth, admin, api_v1


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables and seed records on application startup
    init_db()
    yield


app = FastAPI(
    title="ACT — Actionable Crisis Translator API",
    description="AI-powered personalized emergency decision-support system. Features persistent multi-user storage, RBAC security, live vs demo data provenance, and dynamic routing.",
    version="1.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Enable CORS for Next.js frontend
origins = os.environ.get("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers (root legacy routes for backward compatibility + standard /api/*)
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(alerts.router)
app.include_router(user.router)
app.include_router(risk.router)
app.include_router(route.router)
app.include_router(plan.router)
app.include_router(simulate.router)
app.include_router(api_v1.router, prefix="/api")


@app.get("/")
def root():
    return {
        "message": "Welcome to ACT — Actionable Crisis Translator API (v1.1.0)",
        "docs": "/docs",
        "health": "/health",
        "system_status": "SYSTEM READY",
        "multi_user_support": "ENABLED",
        "database_persistence": "ACTIVE"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
