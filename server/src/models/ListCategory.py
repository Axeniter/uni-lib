from core.database import Base
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship

class ListCategory(Base):
    __tablename__ = "list_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    order = Column(Integer, default=0, nullable=False)
    list_id = Column(Integer, ForeignKey("items_lists.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    parent_list = relationship("UserList", back_populates="categories")