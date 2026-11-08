from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from app.models.complaint import ComplaintCategory, ComplaintPriority, ComplaintStatus
from app.schemas.user import UserResponse
from app.schemas.department import DepartmentResponse

class StatusHistoryResponse(BaseModel):
    id: int
    status: ComplaintStatus
    remarks: Optional[str] = None
    created_at: datetime
    changed_by: Optional[UserResponse] = None

    class Config:
        from_attributes = True

class ComplaintBase(BaseModel):
    title: str
    description: str
    category: ComplaintCategory
    location_address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class ComplaintCreate(ComplaintBase):
    priority: Optional[ComplaintPriority] = ComplaintPriority.MEDIUM

class ComplaintAssignRequest(BaseModel):
    department_id: int
    priority: Optional[ComplaintPriority] = None
    remarks: Optional[str] = None
    assigned_to_user_id: Optional[int] = None

class ComplaintStatusUpdateRequest(BaseModel):
    status: ComplaintStatus
    remarks: Optional[str] = None
    resolution_photo_url: Optional[str] = None

class ComplaintResponse(ComplaintBase):
    id: int
    complaint_code: str
    priority: ComplaintPriority
    status: ComplaintStatus
    photo_url: Optional[str] = None
    resolution_photo_url: Optional[str] = None
    resolution_remarks: Optional[str] = None
    citizen_id: int
    department_id: Optional[int] = None
    assigned_to_user_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None

    citizen: Optional[UserResponse] = None
    department: Optional[DepartmentResponse] = None
    assigned_officer: Optional[UserResponse] = None
    history: Optional[List[StatusHistoryResponse]] = []

    class Config:
        from_attributes = True

class NotificationResponse(BaseModel):
    id: int
    user_id: int
    complaint_id: Optional[int] = None
    title: str
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
