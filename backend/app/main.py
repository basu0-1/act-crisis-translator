from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.db.session import engine, Base
from app.db.seed import seed_database
from app.api.api import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables exist and seed demo data
    Base.metadata.create_all(bind=engine)
    seed_database()
    yield
    # Shutdown


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Emergency decision-support platform API: Converts emergency alerts into personalized risk scores, safe routes, and immediate action plans.",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API endpoints under /api
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "ACT API",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "mode": "DEMO / SIMULATION SUPPORTED" if settings.DEMO_MODE else "PRODUCTION"
    }


@app.exception_handler(500)
async def internal_exception_handler(request: Request, exc: Exception):
    # Never leak stack traces to client in production
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred. Please contact system support."}
    )
