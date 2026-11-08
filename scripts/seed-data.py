#!/usr/bin/env python3
"""
Seed script to populate realistic civic complaints data for demonstrations & interviews.
"""
import sys
import os
from datetime import datetime, timedelta

# Add backend directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

from app.database import SessionLocal, Base, engine
from app.models.department import Department
from app.models.user import User, UserRole
from app.models.complaint import Complaint, ComplaintCategory, ComplaintPriority, ComplaintStatus
from app.models.assignment import StatusHistory
from app.services.auth_service import get_password_hash

def seed_rich_data():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    print("🌱 Seeding Smart City complaints database...")

    # Ensure departments
    depts = {
        "Roads": db.query(Department).filter(Department.name.like("%Roads%")).first(),
        "Water": db.query(Department).filter(Department.name.like("%Water%")).first(),
        "Electricity": db.query(Department).filter(Department.name.like("%Electricity%")).first(),
        "Sanitation": db.query(Department).filter(Department.name.like("%Sanitation%")).first(),
        "Lighting": db.query(Department).filter(Department.name.like("%Lighting%")).first()
    }

    citizen = db.query(User).filter(User.role == UserRole.CITIZEN).first()
    admin = db.query(User).filter(User.role == UserRole.ADMIN).first()

    if not citizen or not admin:
        print("Run app startup first to create default users.")
        return

    sample_complaints = [
        {
            "code": "CMP-1001",
            "title": "Severe Pothole on Express Highway",
            "desc": "Deep pothole causing heavy traffic slowdown and tire burst risk near metro pillar 142.",
            "category": ComplaintCategory.ROAD_DAMAGE,
            "priority": ComplaintPriority.HIGH,
            "status": ComplaintStatus.IN_PROGRESS,
            "loc": "Pari Chowk, Greater Noida Expressway",
            "dept": depts["Roads"]
        },
        {
            "code": "CMP-1002",
            "title": "Main Water Pipeline Burst & Flooding",
            "desc": "Underground drinking water main cracked, wasting thousands of gallons and flooding Sector 62 road.",
            "category": ComplaintCategory.WATER_SEWAGE,
            "priority": ComplaintPriority.CRITICAL,
            "status": ComplaintStatus.ASSIGNED,
            "loc": "Block C Market, Sector 62, Noida",
            "dept": depts["Water"]
        },
        {
            "code": "CMP-1003",
            "title": "Exposed High-Voltage Cable After Storm",
            "desc": "Snapped overhead electrical wire hanging near children's playground. Extreme danger.",
            "category": ComplaintCategory.ELECTRICITY,
            "priority": ComplaintPriority.CRITICAL,
            "status": ComplaintStatus.RESOLVED,
            "loc": "Central Community Park, Alpha 1",
            "dept": depts["Electricity"],
            "resolution_remarks": "Power isolated, damaged segment replaced with armored underground conduit. Inspected safe."
        },
        {
            "code": "CMP-1004",
            "title": "Overflowing Garbage Dumpster Near School",
            "desc": "Municipal bin uncollected for 5 days, strong odor and stray animals obstructing school entrance.",
            "category": ComplaintCategory.GARBAGE_WASTE,
            "priority": ComplaintPriority.MEDIUM,
            "status": ComplaintStatus.SUBMITTED,
            "loc": "Govt High School Gate 2, Delta 2",
            "dept": depts["Sanitation"]
        },
        {
            "code": "CMP-1005",
            "title": "Entire Streetlights Row Inoperative",
            "desc": "8 consecutive LED poles dead between roundabout and residential society entrance. Very dark at night.",
            "category": ComplaintCategory.STREET_LIGHT,
            "priority": ComplaintPriority.HIGH,
            "status": ComplaintStatus.RESOLVED,
            "loc": "Knowledge Park 3 Boulevard",
            "dept": depts["Lighting"],
            "resolution_remarks": "Phase neutral short-circuit inside junction box repaired. All 8 LED luminaires working."
        }
    ]

    for item in sample_complaints:
        existing = db.query(Complaint).filter(Complaint.complaint_code == item["code"]).first()
        if not existing:
            comp = Complaint(
                complaint_code=item["code"],
                title=item["title"],
                description=item["desc"],
                category=item["category"],
                priority=item["priority"],
                status=item["status"],
                location_address=item["loc"],
                citizen_id=citizen.id,
                department_id=item["dept"].id if item["dept"] else None,
                resolution_remarks=item.get("resolution_remarks"),
                resolved_at=datetime.utcnow() if item["status"] == ComplaintStatus.RESOLVED else None
            )
            db.add(comp)
            db.commit()
            db.refresh(comp)

            # Add initial history
            h1 = StatusHistory(
                complaint_id=comp.id,
                status=ComplaintStatus.SUBMITTED,
                remarks="Issue registered by citizen via web portal.",
                changed_by_id=citizen.id
            )
            db.add(h1)

            if item["status"] != ComplaintStatus.SUBMITTED:
                h2 = StatusHistory(
                    complaint_id=comp.id,
                    status=ComplaintStatus.ASSIGNED,
                    remarks=f"Reviewed and assigned to {item['dept'].name} with {item['priority'].value} priority.",
                    changed_by_id=admin.id
                )
                db.add(h2)

            if item["status"] in [ComplaintStatus.IN_PROGRESS, ComplaintStatus.RESOLVED]:
                h3 = StatusHistory(
                    complaint_id=comp.id,
                    status=ComplaintStatus.IN_PROGRESS,
                    remarks="Department repair crew dispatched to site.",
                    changed_by_id=admin.id
                )
                db.add(h3)

            if item["status"] == ComplaintStatus.RESOLVED:
                h4 = StatusHistory(
                    complaint_id=comp.id,
                    status=ComplaintStatus.RESOLVED,
                    remarks=item.get("resolution_remarks", "Defect resolved."),
                    changed_by_id=admin.id
                )
                db.add(h4)

            db.commit()

    print("✅ Rich complaints data seeded successfully!")
    db.close()

if __name__ == "__main__":
    seed_rich_data()
