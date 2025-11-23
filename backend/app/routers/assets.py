"""Asset management router"""
from fastapi import APIRouter

router = APIRouter(prefix="/api/assets", tags=["assets"])

@router.get("/")
async def list_assets():
    """List assets"""
    return {"assets": []}
