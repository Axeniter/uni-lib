from pydantic import BaseModel
from typing import Optional

class ListCategoryCreateRequest(BaseModel):
    name: str
    order: Optional[int] = 0


class ListCategoryCreate(ListCategoryCreateRequest):
    list_id: int


class ListCategoryUpdate(BaseModel):
    name: Optional[str] = None
    order: Optional[int] = None


class ListCategoryResponse(BaseModel):
    id: int
    name: str
    order: int
    list_id: int

    class Config:
        from_attributes = True


