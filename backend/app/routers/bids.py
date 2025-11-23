"""Bid management router"""
from fastapi import APIRouter

router = APIRouter(prefix="/api/bids", tags=["bids"])

@router.get("/")
async def list_bids():
    """List bids"""
    return {"bids": []}
