from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional

class ListItemCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    comment: Optional[str] = None
    rating: Optional[int] = Field(None, ge=1, le=10)
    category_id: Optional[int] = None

    @field_validator('rating')
    @classmethod
    def validate_rating(cls, v):
        if v is not None and (v < 1 or v > 10):
            raise ValueError('Rating must be between 1 and 10')
        return v


class ListItemCreate(ListItemCreateRequest):
    list_id: int


class ListItemUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    comment: Optional[str] = None
    rating: Optional[int] = Field(None, ge=1, le=10)
    category_id: Optional[int] = None
    
    @field_validator('rating')
    @classmethod
    def validate_rating(cls, v):
        if v is not None and (v < 1 or v > 10):
            raise ValueError('Rating must be between 1 and 10')
        return v


class ListItemResponse(BaseModel):
    id: int
    title: str
    comment: Optional[str]
    rating: Optional[int]
    list_id: int
    category_id: Optional[int]
    created_at: datetime
    
    class Config:
        from_attributes = True