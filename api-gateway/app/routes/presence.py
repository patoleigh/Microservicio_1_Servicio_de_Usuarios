from fastapi import APIRouter, Depends, Header, Query
from typing import Dict, Any, Optional
from ..clients.base import presence_client
from ..auth import get_current_user, optional_auth

router = APIRouter(prefix="/presence", tags=["Presence"])

@router.post("/")
async def register_presence(
    presence_data: Dict[str, Any],
    current_user: Optional[Dict] = Depends(optional_auth)
):
    """
    Registrar conexión de usuario (heartbeat automático)
    Body: {
        "userId": "user-id",
        "device": "web|mobile|desktop" (opcional),
        "ip": "192.168.1.1" (opcional)
    }
    """
    return await presence_client.post(
        "/api/v1.0.0/presence",
        json=presence_data
    )

@router.get("/")
async def list_presence(
    status: Optional[str] = Query(None, description="Filtrar por status: online|offline"),
    current_user: Optional[Dict] = Depends(optional_auth)
):
    """Listar presencia de todos los usuarios (con filtro opcional)"""
    params = {}
    if status:
        params["status"] = status
    return await presence_client.get("/api/v1.0.0/presence", params=params)

@router.get("/{user_id}")
async def get_user_presence(
    user_id: str,
    current_user: Optional[Dict] = Depends(optional_auth)
):
    """Obtener estado de presencia de un usuario específico"""
    return await presence_client.get(f"/api/v1.0.0/presence/{user_id}")

@router.get("/stats")
async def get_presence_stats(
    current_user: Optional[Dict] = Depends(optional_auth)
):
    """
    Obtener estadísticas de presencia
    Retorna: { "online": count, "offline": count }
    """
    return await presence_client.get("/api/v1.0.0/presence/stats")

@router.patch("/{user_id}")
async def update_user_presence(
    user_id: str,
    update_data: Dict[str, Any],
    current_user: Optional[Dict] = Depends(optional_auth)
):
    """
    Actualizar status o enviar heartbeat
    Body: {
        "status": "online|offline" (opcional),
        "heartbeat": true (opcional, para mantener vivo)
    }
    """
    return await presence_client.patch(
        f"/api/v1.0.0/presence/{user_id}",
        json=update_data
    )

@router.delete("/{user_id}")
async def delete_user_presence(
    user_id: str,
    current_user: Optional[Dict] = Depends(optional_auth)
):
    """Eliminar registro de presencia de un usuario"""
    return await presence_client.delete(f"/api/v1.0.0/presence/{user_id}")

@router.get("/health")
async def presence_health():
    """Health check del servicio de presencia"""
    return await presence_client.get("/api/v1.0.0/presence/health")
