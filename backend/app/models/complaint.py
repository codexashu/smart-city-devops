import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class ComplaintCategory(str, enum.Enum):
    ROAD_DAMAGE = "ROAD_DAMAGE"
    WATER_SEWAGE = "WATER_SEWAGE"
    ELECTRICITY = "ELECTRICITY"
    GARBAGE_WASTE = "GARBAGE_WASTE"
    STREET_LIGHT = "STREET_LIGHT"
    TRAFFIC_INFRA = "TRAFFIC_INFRA"
    OTHER = "OTHER"

class ComplaintPriority(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class ComplaintStatus(str, enum.Enum):
    SUBMITTED = "SUBMITTED"
    ASSIGNED = "ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    REJECTED = "REJECTED"

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    complaint_code = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(Enum(ComplaintCategory), nullable=False)
    priority = Column(Enum(ComplaintPriority), default=ComplaintPriority.MEDIUM, nullable=False)
    status = Column(Enum(ComplaintStatus), default=ComplaintStatus.SUBMITTED, nullable=False)

    # Location
    location_address = Column(String(300), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # Images
    photo_url = Column(String(500), nullable=True) # Citizen's reported image
    resolution_photo_url = Column(String(500), nullable=True) # Department's fixed proof
    resolution_remarks = Column(Text, nullable=True)

    # Foreign Keys
    citizen_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    assigned_to_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    # Relationships
    citizen = relationship("User", foreign_keys=[citizen_id], back_populates="complaints")
    department = relationship("Department", foreign_keys=[department_id], back_populates="complaints")
    assigned_officer = relationship("User", foreign_keys=[assigned_to_user_id])
    history = relationship("StatusHistory", back_populates="complaint", cascade="all, delete-orphan", order_by="desc(StatusHistory.created_at)")
