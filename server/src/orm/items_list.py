from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import List, Optional
from uuid import UUID
from models.items_list import ItemsList
from schemas.items_list import ItemsListCreate, ItemsListUpdate
from sqlalchemy.orm import selectinload


async def get_list_by_id(db: AsyncSession, list_id: int) -> Optional[ItemsList]:
    result = await db.execute(select(ItemsList).filter(ItemsList.id == list_id))
    return result.scalar_one_or_none()


async def get_lists_by_user_id(db: AsyncSession, user_id: UUID, skip: int = 0, limit: int = 100) -> List[ItemsList]:
    result = await db.execute(
        select(ItemsList)
        .filter(ItemsList.user_id == user_id)
        .order_by(ItemsList.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


async def create_list(db: AsyncSession, list_data: ItemsListCreate, user_id: UUID) -> ItemsList:
    db_list = ItemsList(
        name=list_data.name,
        description=list_data.description,
        user_id=user_id
    )
    db.add(db_list)
    await db.commit()
    await db.refresh(db_list)
    return db_list


async def update_list(db: AsyncSession, list_id: int, list_data: ItemsListUpdate) -> Optional[ItemsList]:
    db_list = await get_list_by_id(db, list_id)
    if not db_list:
        return None
    
    update_data = list_data.model_dump(exclude_none=True)
    for field, value in update_data.items():
        setattr(db_list, field, value)
    
    await db.commit()
    await db.refresh(db_list)
    return db_list


async def delete_list(db: AsyncSession, list_id: int) -> bool:
    db_list = await get_list_by_id(db, list_id)
    if not db_list:
        return False
    
    await db.delete(db_list)
    await db.commit()
    return True


async def get_list_with_items_and_categories(db: AsyncSession, list_id: int) -> Optional[ItemsList]:
    result = await db.execute(
        select(ItemsList)
        .filter(ItemsList.id == list_id)
        .options(
            selectinload(ItemsList.items),
            selectinload(ItemsList.categories)
        )
    )
    return result.scalar_one_or_none()


async def get_user_lists_count(db: AsyncSession, user_id: UUID) -> int:
    result = await db.execute(
        select(func.count()).select_from(ItemsList).filter(ItemsList.user_id == user_id)
    )
    return result.scalar()