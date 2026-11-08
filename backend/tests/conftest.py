import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db
from app.models.department import Department
from app.models.user import User, UserRole
from app.services.auth_service import get_password_hash, create_access_token

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_smart_city.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    # Seed test department
    dept = Department(name="Roads & Bridges", description="Road repairs", contact_email="roads@smartcity.gov")
    db.add(dept)
    db.commit()
    db.refresh(dept)

    # Seed test admin
    admin = User(
        email="admin_test@smartcity.gov",
        hashed_password=get_password_hash("password123"),
        full_name="Admin Test",
        role=UserRole.ADMIN
    )
    # Seed test citizen
    citizen = User(
        email="citizen_test@smartcity.gov",
        hashed_password=get_password_hash("password123"),
        full_name="Citizen Test",
        role=UserRole.CITIZEN
    )
    # Seed test officer
    officer = User(
        email="officer_test@smartcity.gov",
        hashed_password=get_password_hash("password123"),
        full_name="Officer Test",
        role=UserRole.DEPARTMENT_OFFICER,
        department_id=dept.id
    )
    db.add_all([admin, citizen, officer])
    db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture()
def client():
    return TestClient(app)

@pytest.fixture()
def citizen_token():
    return create_access_token(data={"sub": "citizen_test@smartcity.gov", "role": "CITIZEN", "id": 2})

@pytest.fixture()
def admin_token():
    return create_access_token(data={"sub": "admin_test@smartcity.gov", "role": "ADMIN", "id": 1})

@pytest.fixture()
def officer_token():
    return create_access_token(data={"sub": "officer_test@smartcity.gov", "role": "DEPARTMENT_OFFICER", "id": 3})
