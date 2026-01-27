from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import List, Optional
from models.list_item import ListItem
from schemas.list_item import ListItemCreate, ListItemUpdate


async def get_item_by_id(db: AsyncSession, item_id: int) -> Optional[ListItem]:
    result = await db.execute(select(ListItem).filter(ListItem.id == item_id))
    return result.scalar_one_or_none()


async def get_items_by_list_id(db: AsyncSession, list_id: int) -> List[ListItem]:
    result = await db.execute(
        select(ListItem)
        .filter(ListItem.list_id == list_id)
        .order_by(ListItem.created_at.desc())
    )
    return result.scalars().all()


async def get_items_by_list_and_category(db: AsyncSession, list_id: int, category_id: Optional[int] = None) -> List[ListItem]:
    query = select(ListItem).filter(ListItem.list_id == list_id)
    
    if category_id is not None:
        query = query.filter(ListItem.category_id == category_id)
    else:
        query = query.filter(ListItem.category_id.is_(None))
    
    query = query.order_by(ListItem.created_at.desc())
    
    result = await db.execute(query)
    return result.scalars().all()


async def create_item(db: AsyncSession, item_data: ListItemCreate) -> ListItem:
    db_item = ListItem(
        title=item_data.title,
        comment=item_data.comment,
        rating=item_data.rating,
        list_id=item_data.list_id,
        category_id=item_data.category_id
    )
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    return db_item


async def update_item(db: AsyncSession, item_id: int, item_data: ListItemUpdate) -> Optional[ListItem]:
    db_item = await get_item_by_id(db, item_id)
    if not db_item:
        return None
    
    update_data = item_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_item, field, value)

    await db.commit()
    await db.refresh(db_item)
    return db_item


async def delete_item(db: AsyncSession, item_id: int) -> bool:
    db_item = await get_item_by_id(db, item_id)
    if not db_item:
        return False
    
    await db.delete(db_item)
    await db.commit()
    return True

async def get_item_count_by_list_id(db: AsyncSession, list_id: int) -> int:
    result = await db.execute(
        select(func.count())
        .select_from(ListItem)
        .filter(ListItem.list_id == list_id)
    )
    return result.scalar()