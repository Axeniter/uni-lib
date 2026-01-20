from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from config import settings
import redis.asyncio as redis

redis_client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)

engine = create_async_engine(
    settings.DATABASE_URL,
    echo = settings.LOG_SQL,
    future = True
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_ = AsyncSession,
    expire_on_commit = False
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def get_redis() -> redis.Redis:
    return redis_client


async def close_redis():
    await redis_client.close()