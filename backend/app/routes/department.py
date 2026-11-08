from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserRole
from app.models.complaint import Complaint, ComplaintStatus
from app.models.assignment import StatusHistory
from app.models.notification import Notification
from app.schemas.complaint import ComplaintResponse, ComplaintStatusUpdateRequest
from app.services.auth_service import require_department_officer
from app.services.cache_service import cache
from app.utils.metrics import COMPLAINTS_RESOLVED_TOTAL, ACTIVE_COMPLAINTS_GAUGE

router = APIRouter(prefix="/department", tags=["Department Operations"])

@router.get("/complaints", response_model=List[ComplaintResponse])
def get_department_complaints(
    status: Optional[ComplaintStatus] = None,
    current_officer: User = Depends(require_department_officer),
    db: Session = Depends(get_db)
):
    query = db.query(Complaint)
    # Admin can view all, officer views only their department
    if current_officer.role == UserRole.DEPARTMENT_OFFICER:
        if not current_officer.department_id:
            return []
        query = query.filter(Complaint.department_id == current_officer.department_id)

    if status:
        query = query.filter(Complaint.status == status)

    return query.order_by(Complaint.updated_at.desc()).all()

@router.put("/complaints/{complaint_id}/status", response_model=ComplaintResponse)
def update_complaint_status(
    complaint_id: int,
    status_update: ComplaintStatusUpdateRequest,
    current_officer: User = Depends(require_department_officer),
    db: Session = Depends(get_db)
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    if current_officer.role == UserRole.DEPARTMENT_OFFICER and current_officer.department_id:
        if complaint.department_id != current_officer.department_id:
            raise HTTPException(
                status_code=403, 
                detail="You can only update complaints assigned to your department."
            )

    old_status = complaint.status
    new_status = status_update.status
    complaint.status = new_status
    complaint.updated_at = datetime.utcnow()

    if status_update.resolution_photo_url:
        complaint.resolution_photo_url = status_update.resolution_photo_url
    if status_update.remarks:
        complaint.resolution_remarks = status_update.remarks

    if new_status == ComplaintStatus.RESOLVED:
        complaint.resolved_at = datetime.utcnow()
        dept_name = complaint.department.name if complaint.department else "General"
        COMPLAINTS_RESOLVED_TOTAL.labels(department=dept_name).inc()

    # Append to status history
    history = StatusHistory(
        complaint_id=complaint.id,
        status=new_status,
        remarks=status_update.remarks or f"Status changed to {new_status.value}",
        changed_by_id=current_officer.id
    )
    db.add(history)

    # Citizen notification
    msg = f"Your complaint {complaint.complaint_code} has been updated to '{new_status.value}'."
    if new_status == ComplaintStatus.RESOLVED:
        msg = f"Good news! Your complaint {complaint.complaint_code} has been marked RESOLVED. Resolution remarks: {status_update.remarks or 'Work completed successfully.'}"

    notification = Notification(
        user_id=complaint.citizen_id,
        complaint_id=complaint.id,
        title=f"Complaint Status: {new_status.value}",
        message=msg
    )
    db.add(notification)

    db.commit()
    db.refresh(complaint)

    # Update gauge metrics
    ACTIVE_COMPLAINTS_GAUGE.labels(status=old_status.value).dec()
    ACTIVE_COMPLAINTS_GAUGE.labels(status=new_status.value).inc()

    cache.clear_prefix("stats_")
    return complaint
