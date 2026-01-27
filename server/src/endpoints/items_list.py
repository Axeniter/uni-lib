from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from core.database import get_db
from orm.items_list import (
    get_list_by_id, get_lists_by_user_id, create_list, 
    update_list, delete_list, get_list_with_items_and_categories,
    get_user_lists_count
)
from orm.list_category import (
    get_category_by_id, get_categories_by_list_id, create_category,
    update_category, delete_category, get_category_with_items,
    get_categories_count_by_list_id
)
from orm.list_item import (
    get_item_by_id, get_items_by_list_id, create_item,
    update_item, delete_item
)
from schemas.items_list import ItemsListCreate, ItemsListUpdate, ItemsListResponse
from schemas.list_category import ListCategoryCreate, ListCategoryUpdate, ListCategoryResponse, ListCategoryCreateRequest
from schemas.list_item import ListItemCreate, ListItemUpdate, ListItemResponse, ListItemCreateRequest
from core.dependencies import get_current_user

list_router = APIRouter()

@list_router.get("/lists", response_model=List[ItemsListResponse], tags=["lists"])
async def get_user_lists_endpoint(
    skip: int = 0,
    limit: int = 100,
    user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    lists = await get_lists_by_user_id(db, user.id, skip=skip, limit=limit)
    return lists


@list_router.get("/lists/count", tags=["lists"])
async def get_user_lists_count_endpoint(
    user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    count = await get_user_lists_count(db, user)
    return {"count": count}


@list_router.get("/lists/{list_id}/full", tags=["lists"])
async def get_list_full_endpoint(
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


@list_router.get("/lists/{list_id}/items", response_model=List[ListItemResponse], tags=["items"])
async def get_list_items_endpoint(
    list_id: int,
    user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    db_list = await get_list_by_id(db, list_id)
    if db_list is None:
        raise HTTPException(status_code=404, detail="List not found")
    
    if db_list.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    items = await get_items_by_list_id(db, list_id)
    return items


@list_router.get("/lists/{list_id}/categories", response_model=List[ListCategoryResponse], tags=["categories"])
async def get_list_categories_endpoint(
    list_id: int,
    skip: int = 0,
    limit: int = 100,
    user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    db_list = await get_list_by_id(db, list_id)
    if db_list is None:
        raise HTTPException(status_code=404, detail="List not found")
    
    if db_list.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    categories = await get_categories_by_list_id(db, list_id, skip=skip, limit=limit)
    return categories


@list_router.get("/lists/{list_id}/categories/count", tags=["categories"])
async def get_categories_count_endpoint(
    list_id: int,
    user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    db_list = await get_list_by_id(db, list_id)
    if db_list is None:
        raise HTTPException(status_code=404, detail="List not found")
    
    if db_list.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    count = await get_categories_count_by_list_id(db, list_id)
    return {"count": count}


@list_router.get("/lists/{list_id}", response_model=ItemsListResponse, tags=["lists"])
async def get_list_endpoint(
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


@list_router.post("/lists", response_model=ItemsListResponse, tags=["lists"])
async def create_list_endpoint(
    list_data: ItemsListCreate,
    user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    new_list = await create_list(db, list_data, user.id)
    return new_list


@list_router.post("/lists/{list_id}/categories", response_model=ListCategoryResponse, tags=["categories"])
async def create_category_endpoint(
    list_id: int,
    category_request: ListCategoryCreateRequest,
    user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    db_list = await get_list_by_id(db, list_id)
    if db_list is None:
        raise HTTPException(status_code=404, detail="List not found")
    
    if db_list.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    category_data = ListCategoryCreate(
        **category_request.model_dump(),
        list_id=list_id
    )
    new_category = await create_category(db, category_data)
    return new_category


@list_router.post("/lists/{list_id}/items", response_model=ListItemResponse, tags=["items"])
async def create_item_endpoint(
    list_id: int,
    item_request: ListItemCreateRequest,
    user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    db_list = await get_list_by_id(db, list_id)
    if db_list is None:
        raise HTTPException(status_code=404, detail="List not found")
    
    if db_list.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    if item_request.category_id:
        db_category = await get_category_by_id(db, item_request.category_id)
        if (db_category is None) or (db_category.list_id != list_id):
            raise HTTPException(status_code=400, detail="Category not found or doesn't belong to this list")
    
    item_data = ListItemCreate(
        **item_request.model_dump(),
        list_id=list_id
    )
    new_item = await create_item(db, item_data)
    return new_item


@list_router.put("/lists/{list_id}", response_model=ItemsListResponse, tags=["lists"])
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


@list_router.delete("/lists/{list_id}", status_code=status.HTTP_200_OK, tags=["lists"])
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


@list_router.get("/categories/{category_id}/full", tags=["categories"])
async def get_category_with_items_endpoint(
    category_id: int,
    user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    db_category = await get_category_with_items(db, category_id)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    
    db_list = await get_list_by_id(db, db_category.list_id)
    if not db_list:
        raise HTTPException(status_code=404, detail="Category's list not found")

    if db_list.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return db_category


@list_router.get("/categories/{category_id}", response_model=ListCategoryResponse, tags=["categories"])
async def get_category_endpoint(
    category_id: int,
    user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    db_category = await get_category_by_id(db, category_id)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    
    db_list = await get_list_by_id(db, db_category.list_id)
    if not db_list:
        raise HTTPException(status_code=404, detail="Category's list not found")

    if db_list.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return db_category


@list_router.put("/categories/{category_id}", response_model=ListCategoryResponse, tags=["categories"])
async def update_category_endpoint(
    category_id: int,
    category_data: ListCategoryUpdate,
    user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    db_category = await get_category_by_id(db, category_id)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    
    db_list = await get_list_by_id(db, db_category.list_id)
    if not db_list:
        raise HTTPException(status_code=404, detail="Category's list not found")

    if db_list.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    updated_category = await update_category(db, category_id, category_data)
    if updated_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return updated_category


@list_router.delete("/categories/{category_id}", status_code=status.HTTP_200_OK, tags=["categories"])
async def delete_category_endpoint(
    category_id: int,
    user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    db_category = await get_category_by_id(db, category_id)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    
    db_list = await get_list_by_id(db, db_category.list_id)
    if not db_list:
        raise HTTPException(status_code=404, detail="Category's list not found")

    if db_list.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    success = await delete_category(db, category_id)
    if not success:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return None


@list_router.get("/items/{item_id}", response_model=ListItemResponse, tags=["items"])
async def get_item_endpoint(
    item_id: int,
    user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    db_item = await get_item_by_id(db, item_id)
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    
    db_list = await get_list_by_id(db, db_item.list_id)
    if not db_list:
        raise HTTPException(status_code=404, detail="Item's list not found")

    if db_list.user_id != user:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return db_item


@list_router.put("/items/{item_id}", response_model=ListItemResponse, tags=["items"])
async def update_item_endpoint(
    item_id: int,
    item_data: ListItemUpdate,
    user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    db_item = await get_item_by_id(db, item_id)
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    
    db_list = await get_list_by_id(db, db_item.list_id)
    if not db_list:
        raise HTTPException(status_code=404, detail="Item's list not found")

    if db_list.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    if item_data.category_id:
        db_category = await get_category_by_id(db, item_data.category_id)
        if (db_category is None) or (db_category.list_id != db_item.list_id):
            raise HTTPException(status_code=400, detail="Category not found or doesn't belong to this list")
    
    updated_item = await update_item(db, item_id, item_data)
    if updated_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    
    return updated_item


@list_router.delete("/items/{item_id}", status_code=status.HTTP_200_OK, tags=["items"])
async def delete_item_endpoint(
    item_id: int,
    user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    db_item = await get_item_by_id(db, item_id)
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    
    db_list = await get_list_by_id(db, db_item.list_id)
    if not db_list:
        raise HTTPException(status_code=404, detail="Item's list not found")

    if db_list.user_id != user:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    success = await delete_item(db, item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found")
    
    return None