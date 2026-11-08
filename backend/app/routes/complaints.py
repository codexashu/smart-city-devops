import os
import uuid
import shutil
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app.models.user import User, UserRole
from app.models.complaint import Complaint, ComplaintCategory, ComplaintPriority, ComplaintStatus
from app.models.assignment import StatusHistory
from app.models.notification import Notification
from app.schemas.complaint import ComplaintCreate, ComplaintResponse
from app.services.auth_service import get_current_user
from app.services.cache_service import cache
from app.utils.metrics import COMPLAINTS_CREATED_TOTAL, ACTIVE_COMPLAINTS_GAUGE

router = APIRouter(prefix="/complaints", tags=["Complaints"])

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

def generate_complaint_code(db: Session) -> str:
    last_complaint = db.query(Complaint).order_by(Complaint.id.desc()).first()
    next_id = 1001 if not last_complaint else (last_complaint.id + 1001)
    return f"CMP-{next_id}"

@router.post("/upload", response_model=dict)
async def upload_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image (JPEG, PNG, WebP)"
        )

    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4().hex}{file_extension}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"photo_url": f"/uploads/{unique_filename}"}

@router.post("/", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
def create_complaint(
    complaint_in: ComplaintCreate,
    photo_url: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    code = generate_complaint_code(db)
    new_complaint = Complaint(
        complaint_code=code,
        title=complaint_in.title,
        description=complaint_in.description,
        category=complaint_in.category,
        priority=complaint_in.priority or ComplaintPriority.MEDIUM,
        status=ComplaintStatus.SUBMITTED,
        location_address=complaint_in.location_address,
        latitude=complaint_in.latitude,
        longitude=complaint_in.longitude,
        photo_url=photo_url,
        citizen_id=current_user.id
    )
    db.add(new_complaint)
    db.commit()
    db.refresh(new_complaint)

    # Initial Status History record
    history = StatusHistory(
        complaint_id=new_complaint.id,
        status=ComplaintStatus.SUBMITTED,
        remarks="Complaint filed by citizen.",
        changed_by_id=current_user.id
    )
    db.add(history)

    # Citizen confirmation notification
    notification = Notification(
        user_id=current_user.id,
        complaint_id=new_complaint.id,
        title="Complaint Submitted",
        message=f"Your complaint {code} regarding '{new_complaint.title}' has been registered successfully."
    )
    db.add(notification)
    db.commit()
    db.refresh(new_complaint)

    # Prometheus Metric
    COMPLAINTS_CREATED_TOTAL.labels(
        category=new_complaint.category.value,
        priority=new_complaint.priority.value
    ).inc()
    ACTIVE_COMPLAINTS_GAUGE.labels(status=ComplaintStatus.SUBMITTED.value).inc()

    # Invalidate dashboard caches
    cache.clear_prefix("stats_")
    cache.clear_prefix(f"citizen_complaints_{current_user.id}")

    return new_complaint

@router.get("/", response_model=List[ComplaintResponse])
def get_user_complaints(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == UserRole.CITIZEN:
        complaints = (
            db.query(Complaint)
            .filter(Complaint.citizen_id == current_user.id)
            .order_by(Complaint.created_at.desc())
            .all()
        )
    else:
        complaints = db.query(Complaint).order_by(Complaint.created_at.desc()).all()
    return complaints

@router.get("/track/{code}", response_model=ComplaintResponse)
def track_complaint(code: str, db: Session = Depends(get_db)):
    cached_complaint = cache.get(f"track_{code}")
    if cached_complaint:
        # If cached, we can return or re-fetch for fresh status
        pass

    complaint = db.query(Complaint).filter(Complaint.complaint_code == code.upper()).first()
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Complaint with ID {code} not found."
        )
    return complaint

@router.get("/{complaint_id}", response_model=ComplaintResponse)
def get_complaint_details(
    complaint_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found"
        )

    # Role-based restriction for citizens
    if current_user.role == UserRole.CITIZEN and complaint.citizen_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: you do not own this complaint."
        )

    return complaint
