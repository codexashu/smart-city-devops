from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class DepartmentBase(BaseModel):
    name: str
    description: Optional[str] = None
    contact_email: Optional[str] = None
    head_name: Optional[str] = None

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentResponse(DepartmentBase):
    id: int
    created_at: datetime
    active_complaints_count: Optional[int] = 0
    resolved_complaints_count: Optional[int] = 0

    class Config:
        from_attributes = True
