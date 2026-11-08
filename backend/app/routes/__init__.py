from app.routes.auth import router as auth_router
from app.routes.complaints import router as complaints_router
from app.routes.admin import router as admin_router
from app.routes.department import router as department_router
from app.routes.notifications import router as notifications_router

__all__ = [
    "auth_router",
    "complaints_router",
    "admin_router",
    "department_router",
    "notifications_router"
]
