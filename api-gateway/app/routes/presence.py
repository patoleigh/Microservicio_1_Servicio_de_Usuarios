from fastapi import APIRouter, Depends, Header, Query
from typing import Dict, Any, Optional
from ..clients.base import presence_client
from ..auth import get_current_user

router = APIRouter(prefix="/presence", tags=["Presence"])

@router.post("/")
async def update_presence(
    presence_data: Dict[str, Any],
    current_user: Dict = Depends(get_current_user),
    authorization: str = Header(...)
):
    """
    Actualizar estado de presencia del usuario
    Body: {"status": "online|offline|away", "userId": "user-id"}
    """
    return await presence_client.post(
        "/api/v1.0.0/presence",
        json=presence_data,
        headers={"Authorization": authorization}
    )

@router.get("/{user_id}")
async def get_user_presence(
    user_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Obtener estado de presencia de un usuario"""
    return await presence_client.get(f"/api/v1.0.0/presence/{user_id}")

@router.get("/stats")
async def get_presence_stats():
    """Obtener estadísticas generales de presencia"""
    return await presence_client.get("/api/v1.0.0/presence/stats")

@router.get("/health")
async def presence_health():
    """Health check del servicio de presencia"""
    return await presence_client.get("/api/v1.0.0/presence/health")
