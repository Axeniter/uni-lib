from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from core.database import get_db
from orm.items_list import (
    get_list_by_id, get_lists_by_user_id, create_list, 
    update_list, delete_list, get_list_with_items_and_categories,
    get_user_lists_count
)
from schemas.items_list import ItemsListCreate, ItemsListUpdate, ItemsListResponse
from core.dependencies import get_current_user

list_router = APIRouter(prefix="/lists")


@list_router.get("/", response_model=List[ItemsListResponse], tags=["lists"])
async def get_user_lists(
    skip: int = 0,
    limit: int = 100,
    user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    lists = await get_lists_by_user_id(db, user.id, skip=skip, limit=limit)
    return lists


@list_router.get("/count", tags=["lists"])
async def get_user_lists_count_endpoint(
    user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    count = await get_user_lists_count(db, user)
    return {"count": count}


@list_router.get("/{list_id}/all", tags=["lists"])
async def get_list_full(
    list_id: int,
    user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    db_list = await get_list_with_items_and_categories(db, list_id)
    if db_list is None:
        raise HTTPException(status_code=404, detail="List not found")
    
    if db_list.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return db_list


@list_router.get("/{list_id}", response_model=ItemsListResponse, tags=["lists"])
async def get_list(
    list_id: int,
    user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    db_list = await get_list_by_id(db, list_id)
    if db_list is None:
        raise HTTPException(status_code=404, detail="List not found")
    
    if db_list.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return db_list


@list_router.post("/", response_model=ItemsListResponse, tags=["lists"])
async def create_list_endpoint(
    list_data: ItemsListCreate,
    user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    new_list = await create_list(db, list_data, user)
    return new_list


@list_router.put("/{list_id}", response_model=ItemsListResponse, tags=["lists"])
async def update_list_endpoint(
    list_id: int,
    list_data: ItemsListUpdate,
    user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    db_list = await get_list_by_id(db, list_id)
    if db_list is None:
        raise HTTPException(status_code=404, detail="List not found")
    
    if db_list.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    updated_list = await update_list(db, list_id, list_data)
    if updated_list is None:
        raise HTTPException(status_code=404, detail="List not found")
    
    return updated_list


@list_router.delete("/{list_id}", status_code=status.HTTP_200_OK, tags=["lists"])
async def delete_list_endpoint(
    list_id: int,
    user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    db_list = await get_list_by_id(db, list_id)
    if db_list is None:
        raise HTTPException(status_code=404, detail="List not found")
    
    if db_list.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    success = await delete_list(db, list_id)
    if not success:
        raise HTTPException(status_code=404, detail="List not found")
    
    return None