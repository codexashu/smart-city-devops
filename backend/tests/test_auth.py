def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_metrics_endpoint(client):
    response = client.get("/metrics")
    assert response.status_code == 200
    assert "smartcity_http_requests_total" in response.text

def test_user_registration(client):
    payload = {
        "email": "newuser@test.com",
        "password": "Password123!",
        "full_name": "New Citizen User",
        "phone": "+91-9123456789"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@test.com"
    assert data["role"] == "CITIZEN"

def test_user_login(client):
    payload = {
        "email": "citizen_test@smartcity.gov",
        "password": "password123"
    }
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
