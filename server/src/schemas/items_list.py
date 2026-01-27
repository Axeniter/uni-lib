from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field

class ItemsListCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None


class ItemsListUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None


class ItemsListResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True