from fastapi import APIRouter

from app.api.v1.routes import (
    analytics_routes,
    auth_routes,
    criteria_routes,
    industries_routes,
    marks_routes,
    points_routes,
    sub_industries_routes,
    users_routes,
    achievement_routes, 
    gamification_routes
)

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth_routes.router)
api_router.include_router(industries_routes.router)
api_router.include_router(sub_industries_routes.router)
api_router.include_router(criteria_routes.router)
api_router.include_router(users_routes.router)
api_router.include_router(points_routes.router)
api_router.include_router(marks_routes.router)
api_router.include_router(gamification_routes.router)
api_router.include_router(achievement_routes.router)
api_router.include_router(analytics_routes.router)
