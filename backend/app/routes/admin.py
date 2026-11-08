from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.user import User
from app.models.department import Department
from app.models.complaint import Complaint, ComplaintPriority, ComplaintStatus, ComplaintCategory
from app.models.assignment import StatusHistory
from app.models.notification import Notification
from app.schemas.complaint import ComplaintResponse, ComplaintAssignRequest
from app.schemas.department import DepartmentResponse, DepartmentCreate
from app.services.auth_service import require_admin
from app.services.cache_service import cache
from app.utils.metrics import ACTIVE_COMPLAINTS_GAUGE

router = APIRouter(prefix="/admin", tags=["Admin Management"])

@router.get("/complaints", response_model=List[ComplaintResponse])
def get_all_complaints(
    status: Optional[ComplaintStatus] = None,
    priority: Optional[ComplaintPriority] = None,
    category: Optional[ComplaintCategory] = None,
    department_id: Optional[int] = None,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    query = db.query(Complaint)
    if status:
        query = query.filter(Complaint.status == status)
    if priority:
        query = query.filter(Complaint.priority == priority)
    if category:
        query = query.filter(Complaint.category == category)
    if department_id:
        query = query.filter(Complaint.department_id == department_id)

    return query.order_by(Complaint.created_at.desc()).all()

@router.put("/complaints/{complaint_id}/assign", response_model=ComplaintResponse)
def assign_complaint(
    complaint_id: int,
    assign_in: ComplaintAssignRequest,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    department = db.query(Department).filter(Department.id == assign_in.department_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")

    old_status = complaint.status
    complaint.department_id = assign_in.department_id
    if assign_in.priority:
        complaint.priority = assign_in.priority
    if assign_in.assigned_to_user_id:
        complaint.assigned_to_user_id = assign_in.assigned_to_user_id

    complaint.status = ComplaintStatus.ASSIGNED
    complaint.updated_at = datetime.utcnow()

    # Add to status history
    history = StatusHistory(
        complaint_id=complaint.id,
        status=ComplaintStatus.ASSIGNED,
        remarks=assign_in.remarks or f"Assigned to {department.name} with {complaint.priority.value} priority.",
        changed_by_id=current_admin.id
    )
    db.add(history)

    # Notify Citizen
    notification = Notification(
        user_id=complaint.citizen_id,
        complaint_id=complaint.id,
        title="Complaint Assigned",
        message=f"Your complaint {complaint.complaint_code} has been assigned to the {department.name} department."
    )
    db.add(notification)

    db.commit()
    db.refresh(complaint)

    # Update gauge metrics
    ACTIVE_COMPLAINTS_GAUGE.labels(status=old_status.value).dec()
    ACTIVE_COMPLAINTS_GAUGE.labels(status=ComplaintStatus.ASSIGNED.value).inc()

    cache.clear_prefix("stats_")
    return complaint

@router.get("/departments", response_model=List[DepartmentResponse])
def get_departments(db: Session = Depends(get_db)):
    cached_depts = cache.get("departments_list")
    if cached_depts:
        return cached_depts

    departments = db.query(Department).all()
    result = []
    for dept in departments:
        active_count = db.query(Complaint).filter(
            Complaint.department_id == dept.id,
            Complaint.status.in_([ComplaintStatus.ASSIGNED, ComplaintStatus.IN_PROGRESS])
        ).count()
        resolved_count = db.query(Complaint).filter(
            Complaint.department_id == dept.id,
            Complaint.status == ComplaintStatus.RESOLVED
        ).count()

        result.append(DepartmentResponse(
            id=dept.id,
            name=dept.name,
            description=dept.description,
            contact_email=dept.contact_email,
            head_name=dept.head_name,
            created_at=dept.created_at,
            active_complaints_count=active_count,
            resolved_complaints_count=resolved_count
        ))

    # Cache for 60 seconds
    cache.set("departments_list", [d.dict() for d in result], expire_seconds=60)
    return result

@router.post("/departments", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED)
def create_department(
    dept_in: DepartmentCreate,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    existing = db.query(Department).filter(Department.name == dept_in.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Department already exists")

    dept = Department(
        name=dept_in.name,
        description=dept_in.description,
        contact_email=dept_in.contact_email,
        head_name=dept_in.head_name
    )
    db.add(dept)
    db.commit()
    db.refresh(dept)
    cache.delete("departments_list")
    return dept

@router.get("/stats")
def get_system_stats(
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    total = db.query(Complaint).count()
    submitted = db.query(Complaint).filter(Complaint.status == ComplaintStatus.SUBMITTED).count()
    assigned = db.query(Complaint).filter(Complaint.status == ComplaintStatus.ASSIGNED).count()
    in_progress = db.query(Complaint).filter(Complaint.status == ComplaintStatus.IN_PROGRESS).count()
    resolved = db.query(Complaint).filter(Complaint.status == ComplaintStatus.RESOLVED).count()

    # Resolution SLA percentage
    resolution_rate = round((resolved / total * 100), 1) if total > 0 else 0

    # Category Breakdown
    cat_counts = db.query(Complaint.category, func.count(Complaint.id)).group_by(Complaint.category).all()
    categories_data = {cat.value: count for cat, count in cat_counts}

    # Department Performance
    departments = db.query(Department).all()
    dept_performance = []
    for dept in departments:
        dept_total = db.query(Complaint).filter(Complaint.department_id == dept.id).count()
        dept_resolved = db.query(Complaint).filter(Complaint.department_id == dept.id, Complaint.status == ComplaintStatus.RESOLVED).count()
        dept_performance.append({
            "department_id": dept.id,
            "name": dept.name,
            "total_assigned": dept_total,
            "resolved": dept_resolved,
            "resolution_rate": round((dept_resolved / dept_total * 100), 1) if dept_total > 0 else 0
        })

    return {
        "summary": {
            "total_complaints": total,
            "submitted": submitted,
            "assigned": assigned,
            "in_progress": in_progress,
            "resolved": resolved,
            "resolution_rate": resolution_rate
        },
        "by_category": categories_data,
        "department_performance": dept_performance
    }
