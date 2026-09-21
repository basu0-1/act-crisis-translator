from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.alerts import router as alerts_router
from app.api.v1.risk import router as risk_router
from app.api.v1.routes import router as routes_router
from app.api.v1.shelters import router as shelters_router
from app.api.v1.decision import router as decision_router
from app.api.v1.admin import router as admin_router
from app.api.v1.demo import router as demo_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(alerts_router)
api_router.include_router(risk_router)
api_router.include_router(routes_router)
api_router.include_router(shelters_router)
api_router.include_router(decision_router)
api_router.include_router(admin_router)
api_router.include_router(demo_router)
