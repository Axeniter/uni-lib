from core.database import Base
from sqlalchemy import Column, String, Text, Integer, ForeignKey, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

class ItemsList(Base):
    __tablename__ = "items_lists"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=True)
    user_id = Column(UUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", back_populates="lists")
    categories = relationship("ListCategory", back_populates="parent_list", cascade="all, delete-orphan")
    items = relationship("ListItem", back_populates="list", cascade="all, delete-orphan")