from fastapi import APIRouter
from endpoints.auth import auth_router
from endpoints.items_list import list_router

api_router = APIRouter(prefix="/api")

api_router.include_router(auth_router)
api_router.include_router(list_router)