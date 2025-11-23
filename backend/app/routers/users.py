"""User management router"""
from fastapi import APIRouter

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/")
async def list_users():
    """List users"""
    return {"users": []}
