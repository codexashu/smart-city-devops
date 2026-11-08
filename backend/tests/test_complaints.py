def test_create_and_get_complaint(client, citizen_token):
    headers = {"Authorization": f"Bearer {citizen_token}"}
    payload = {
        "title": "Severe Pothole on MG Road",
        "description": "Large pothole causing vehicle damage and traffic jams near metro pillar 45.",
        "category": "ROAD_DAMAGE",
        "priority": "HIGH",
        "location_address": "MG Road Sector 14, Greater Noida",
        "latitude": 28.4744,
        "longitude": 77.5040
    }
    response = client.post("/api/complaints/", json=payload, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == payload["title"]
    assert data["status"] == "SUBMITTED"
    assert "CMP-" in data["complaint_code"]

    # Retrieve citizen complaints
    get_res = client.get("/api/complaints/", headers=headers)
    assert get_res.status_code == 200
    complaints = get_res.json()
    assert len(complaints) >= 1

    # Public tracking endpoint
    track_res = client.get(f"/api/complaints/track/{data['complaint_code']}")
    assert track_res.status_code == 200
    assert track_res.json()["complaint_code"] == data["complaint_code"]
