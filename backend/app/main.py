import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.database import Base, engine, SessionLocal
from app.models.user import User, UserRole
from app.models.department import Department
from app.services.auth_service import get_password_hash
from app.utils.metrics import PrometheusMiddleware, metrics_endpoint
from app.routes import (
    auth_router,
    complaints_router,
    admin_router,
    department_router,
    notifications_router
)

def seed_initial_data():
    """Seeds essential departments and demo users for immediate testing & demos."""
    db = SessionLocal()
    try:
        # 1. Seed Municipal Departments
        if db.query(Department).count() == 0:
            departments = [
                Department(name="Roads & Bridges", description="Road repairs, potholes, sidewalks, and bridges maintenance", contact_email="roads@smartcity.gov", head_name="Rajesh Sharma"),
                Department(name="Water & Sewage", description="Water supply, pipeline leakages, drainage, and sewage maintenance", contact_email="water@smartcity.gov", head_name="Sunita Verma"),
                Department(name="Electricity & Power", description="Power outages, transformer faults, and electrical safety", contact_email="power@smartcity.gov", head_name="Anil Kumar"),
                Department(name="Sanitation & Waste", description="Garbage collection, waste dumping, and city cleanliness", contact_email="sanitation@smartcity.gov", head_name="Pooja Mehra"),
                Department(name="Street Lighting", description="Street light repairs, LED replacements, and timers", contact_email="lighting@smartcity.gov", head_name="Vikas Gupta"),
            ]
            db.add_all(departments)
            db.commit()

        # 2. Seed Default Admin
        admin_user = db.query(User).filter(User.email == "admin@smartcity.gov").first()
        if not admin_user:
            admin_user = User(
                email="admin@smartcity.gov",
                hashed_password=get_password_hash("Admin@12345"),
                full_name="Municipal Commissioner Admin",
                phone="+91-9876543210",
                role=UserRole.ADMIN
            )
            db.add(admin_user)

        # 3. Seed Default Department Officer (Roads)
        roads_dept = db.query(Department).filter(Department.name == "Roads & Bridges").first()
        dept_user = db.query(User).filter(User.email == "officer.roads@smartcity.gov").first()
        if not dept_user and roads_dept:
            dept_user = User(
                email="officer.roads@smartcity.gov",
                hashed_password=get_password_hash("Officer@12345"),
                full_name="Er. Rajesh Sharma (Roads Officer)",
                phone="+91-9876543211",
                role=UserRole.DEPARTMENT_OFFICER,
                department_id=roads_dept.id
            )
            db.add(dept_user)

        # 4. Seed Default Citizen
        citizen_user = db.query(User).filter(User.email == "citizen@smartcity.gov").first()
        if not citizen_user:
            citizen_user = User(
                email="citizen@smartcity.gov",
                hashed_password=get_password_hash("Citizen@12345"),
                full_name="Ashutosh Citizen",
                phone="+91-9876543212",
                role=UserRole.CITIZEN
            )
            db.add(citizen_user)

        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error seeding initial data: {e}")
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables and seed data
    Base.metadata.create_all(bind=engine)
    seed_initial_data()
    yield
    # Shutdown logic (if any)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Production-grade Smart City Complaint & Infrastructure Management Platform REST API",
    lifespan=lifespan
)

# Prometheus Metrics Middleware
app.add_middleware(PrometheusMiddleware)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Upload directory static mount
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Health Check Endpoints (K8s probes)
@app.get("/health", tags=["System"])
@app.get("/api/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }

# Prometheus Scrape Endpoint
@app.get("/metrics", tags=["System"])
def metrics():
    return metrics_endpoint()

# Include Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(complaints_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)
app.include_router(department_router, prefix=settings.API_V1_STR)
app.include_router(notifications_router, prefix=settings.API_V1_STR)
