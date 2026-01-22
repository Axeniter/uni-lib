from core.database import Base
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship

class ListItem(Base):
    __tablename__ = "list_items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, index=True)
    comment = Column(Text, nullable=True)
    rating = Column(Integer, nullable=True)
    list_id = Column(Integer, ForeignKey("items_lists.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(Integer, ForeignKey("list_categories.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    list = relationship("ItemsList", back_populates="items")
    category = relationship("ListCategory", back_populates="items")
