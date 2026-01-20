from datetime import datetime, timedelta, timezone
import jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status
from config import settings
from .database import get_redis
from uuid import UUID
from typing import Optional
import secrets

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict):
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = data.copy()
    payload.update({"exp": expire, "type": "access"})
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def verify_token(token: str):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


def create_refresh_token() -> str:
    return secrets.token_urlsafe(settings.REFRESH_TOKEN_LENGTH)


async def set_refresh_token(user_id: UUID, refresh_token: str):
    key = f"refresh_token:{refresh_token}"
    rd = await get_redis()
    await rd.setex(key, settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400, str(user_id))


async def get_user_id_by_refresh_token(refresh_token: str) -> Optional[UUID]:
    key = f"refresh_token:{refresh_token}"
    rd = await get_redis()
    user_id_str =  await rd.get(key)
    if user_id_str:
        try:
            return UUID(user_id_str)
        except ValueError:
            return None
    return None


async def create_and_save_refresh_token(user_id: UUID) -> str:
    refresh_token = create_refresh_token()
    await set_refresh_token(user_id, refresh_token)
    return refresh_token


async def delete_refresh_token(refresh_token: str):
    key = f"refresh_token:{refresh_token}"
    rd = await get_redis()
    await rd.delete(key)


async def add_to_blacklist(token: str):
    rd = await get_redis()
    await rd.setex(f"blacklist:{token}", settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60, "1")


async def is_blacklisted(token: str) -> bool:
    rd = await get_redis()
    return await rd.exists(f"blacklist:{token}") == 1