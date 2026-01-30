from pydantic import BaseModel, Field
from typing import Optional

class ListCategoryCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    order: Optional[int] = 0


class ListCategoryCreate(ListCategoryCreateRequest):
    list_id: int


class ListCategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    order: Optional[int] = None


class ListCategoryResponse(BaseModel):
    id: int
    name: str
    order: int
    list_id: int

    class Config:
        from_attributes = True


