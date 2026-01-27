from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel

class ItemsListCreate(BaseModel):
    name: str
    description: Optional[str] = None

class ItemsListUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class ItemsListResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True