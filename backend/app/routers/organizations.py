"""Organization management router"""
from fastapi import APIRouter

router = APIRouter(prefix="/api/organizations", tags=["organizations"])

@router.get("/")
async def list_organizations():
    """List organizations"""
    return {"organizations": []}
