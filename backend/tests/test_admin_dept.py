def test_admin_assign_and_department_resolve(client, citizen_token, admin_token, officer_token):
    # 1. Citizen creates complaint
    cit_headers = {"Authorization": f"Bearer {citizen_token}"}
    create_payload = {
        "title": "Broken Street light near park",
        "description": "Streetlight pole 12 is flickering and wire is exposed.",
        "category": "STREET_LIGHT",
        "priority": "MEDIUM",
        "location_address": "City Central Park Gate 2"
    }
    create_res = client.post("/api/complaints/", json=create_payload, headers=cit_headers)
    complaint_id = create_res.json()["id"]

    # 2. Admin assigns complaint to Roads & Bridges (dept id 1)
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    assign_payload = {
        "department_id": 1,
        "priority": "HIGH",
        "remarks": "Assigned to Roads & Bridges for immediate field inspection."
    }
    assign_res = client.put(f"/api/admin/complaints/{complaint_id}/assign", json=assign_payload, headers=admin_headers)
    assert assign_res.status_code == 200
    assert assign_res.json()["status"] == "ASSIGNED"
    assert assign_res.json()["priority"] == "HIGH"

    # 3. Department officer updates to IN_PROGRESS
    officer_headers = {"Authorization": f"Bearer {officer_token}"}
    progress_payload = {
        "status": "IN_PROGRESS",
        "remarks": "Maintenance van dispatched to site."
    }
    prog_res = client.put(f"/api/department/complaints/{complaint_id}/status", json=progress_payload, headers=officer_headers)
    assert prog_res.status_code == 200
    assert prog_res.json()["status"] == "IN_PROGRESS"

    # 4. Department officer marks RESOLVED with resolution proof & remarks
    resolve_payload = {
        "status": "RESOLVED",
        "remarks": "Wire repaired and bulb replaced. Illumination tested and verified.",
        "resolution_photo_url": "/uploads/mock-fixed.jpg"
    }
    res_res = client.put(f"/api/department/complaints/{complaint_id}/status", json=resolve_payload, headers=officer_headers)
    assert res_res.status_code == 200
    assert res_res.json()["status"] == "RESOLVED"
    assert res_res.json()["resolution_photo_url"] == "/uploads/mock-fixed.jpg"

    # 5. Check Admin Stats
    stats_res = client.get("/api/admin/stats", headers=admin_headers)
    assert stats_res.status_code == 200
    data = stats_res.json()
    assert data["summary"]["resolved"] >= 1
