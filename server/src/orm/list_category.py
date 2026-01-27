from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import List, Optional
from models.list_category import ListCategory
from schemas.list_category import ListCategoryCreate, ListCategoryUpdate
from sqlalchemy.orm import selectinload


async def get_category_by_id(db: AsyncSession, category_id: int) -> Optional[ListCategory]:
    result = await db.execute(select(ListCategory).filter(ListCategory.id == category_id))
    return result.scalar_one_or_none()


async def get_categories_by_list_id(db: AsyncSession, list_id: int, skip: int = 0, limit: int = 100) -> List[ListCategory]:
    result = await db.execute(
        select(ListCategory)
        .filter(ListCategory.list_id == list_id)
        .order_by(ListCategory.order.asc(), ListCategory.created_at.asc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


async def create_category(db: AsyncSession, category_data: ListCategoryCreate) -> ListCategory:
    db_category = ListCategory(
        name=category_data.name,
        order=category_data.order if category_data.order is not None else 0,
        list_id=category_data.list_id
    )
    db.add(db_category)
    await db.commit()
    await db.refresh(db_category)
    return db_category


async def update_category(db: AsyncSession, category_id: int, category_data: ListCategoryUpdate) -> Optional[ListCategory]:
    db_category = await get_category_by_id(db, category_id)
    if not db_category:
        return None
    
    update_data = category_data.model_dump(exclude_none=True)
    for field, value in update_data.items():
        setattr(db_category, field, value)

    await db.commit()
    await db.refresh(db_category)
    return db_category


async def delete_category(db: AsyncSession, category_id: int) -> bool:
    db_category = await get_category_by_id(db, category_id)
    if not db_category:
        return False
    
    await db.delete(db_category)
    await db.commit()
    return True


async def get_category_with_items(db: AsyncSession, category_id: int) -> Optional[ListCategory]:
    result = await db.execute(
        select(ListCategory)
        .filter(ListCategory.id == category_id)
        .options(selectinload(ListCategory.items))
    )
    return result.scalar_one_or_none()


async def get_categories_count_by_list_id(db: AsyncSession, list_id: int) -> int:
    result = await db.execute(
        select(func.count())
        .select_from(ListCategory)
        .filter(ListCategory.list_id == list_id)
    )
    return result.scalar()