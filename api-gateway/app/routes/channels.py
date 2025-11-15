from fastapi import APIRouter, Depends, Header
from typing import Dict, Any
from ..clients.base import channel_client
from ..auth import get_current_user

router = APIRouter(prefix="/channels", tags=["Channels"])

# ========== CHANNELS ==========

@router.post("/")
async def create_channel(
    channel_data: Dict[str, Any],
    current_user: Dict = Depends(get_current_user),
    authorization: str = Header(...)
):
    """
    Crear un nuevo canal
    Body: {
        "name": "nombre del canal",
        "description": "descripción",
        "owner_id": "user-id"
    }
    """
    return await channel_client.post(
        "/v1/channels/",
        json=channel_data,
        headers={"Authorization": authorization}
    )

@router.get("/{channel_id}")
async def get_channel(
    channel_id: str,
    current_user: Dict = Depends(get_current_user),
    authorization: str = Header(...)
):
    """Obtener información de un canal"""
    return await channel_client.get(
        f"/v1/channels/{channel_id}",
        headers={"Authorization": authorization}
    )

@router.get("/{channel_id}/basic")
async def get_channel_basic(
    channel_id: str,
    current_user: Dict = Depends(get_current_user),
    authorization: str = Header(...)
):
    """Obtener información básica de un canal"""
    return await channel_client.get(
        f"/v1/channels/{channel_id}/basic",
        headers={"Authorization": authorization}
    )

@router.put("/{channel_id}")
async def update_channel(
    channel_id: str,
    channel_data: Dict[str, Any],
    current_user: Dict = Depends(get_current_user),
    authorization: str = Header(...)
):
    """
    Actualizar un canal
    Body: {
        "name": "nuevo nombre",
        "description": "nueva descripción"
    }
    """
    return await channel_client.put(
        f"/v1/channels/{channel_id}",
        json=channel_data,
        headers={"Authorization": authorization}
    )

@router.delete("/{channel_id}")
async def delete_channel(
    channel_id: str,
    current_user: Dict = Depends(get_current_user),
    authorization: str = Header(...)
):
    """Eliminar (desactivar) un canal"""
    return await channel_client.delete(
        f"/v1/channels/{channel_id}",
        headers={"Authorization": authorization}
    )

@router.post("/{channel_id}/reactivate")
async def reactivate_channel(
    channel_id: str,
    current_user: Dict = Depends(get_current_user),
    authorization: str = Header(...)
):
    """Reactivar un canal eliminado"""
    return await channel_client.post(
        f"/v1/channels/{channel_id}/reactivate",
        json={},
        headers={"Authorization": authorization}
    )

# ========== MEMBERS ==========

@router.post("/members")
async def add_member(
    member_data: Dict[str, Any],
    current_user: Dict = Depends(get_current_user),
    authorization: str = Header(...)
):
    """
    Agregar miembro a un canal
    Body: {
        "user_id": "user-id",
        "channel_id": "channel-id",
        "role": "member|admin"
    }
    """
    return await channel_client.post(
        "/v1/members/",
        json=member_data,
        headers={"Authorization": authorization}
    )

@router.delete("/members")
async def remove_member(
    member_data: Dict[str, Any],
    current_user: Dict = Depends(get_current_user),
    authorization: str = Header(...)
):
    """
    Remover miembro de un canal
    Body: {
        "user_id": "user-id",
        "channel_id": "channel-id"
    }
    """
    return await channel_client.delete(
        "/v1/members/",
        headers={"Authorization": authorization}
    )

@router.get("/members/user/{user_id}")
async def get_user_channels(
    user_id: str,
    current_user: Dict = Depends(get_current_user),
    authorization: str = Header(...)
):
    """Obtener todos los canales de un usuario"""
    return await channel_client.get(
        f"/v1/members/{user_id}",
        headers={"Authorization": authorization}
    )

@router.get("/members/owner/{owner_id}")
async def get_owned_channels(
    owner_id: str,
    current_user: Dict = Depends(get_current_user),
    authorization: str = Header(...)
):
    """Obtener canales donde el usuario es owner"""
    return await channel_client.get(
        f"/v1/members/owner/{owner_id}",
        headers={"Authorization": authorization}
    )

@router.get("/{channel_id}/members")
async def get_channel_members(
    channel_id: str,
    current_user: Dict = Depends(get_current_user),
    authorization: str = Header(...)
):
    """Obtener todos los miembros de un canal"""
    return await channel_client.get(
        f"/v1/members/channel/{channel_id}",
        headers={"Authorization": authorization}
    )

# ========== THREADS ==========

@router.post("/threads")
async def create_thread(
    thread_data: Dict[str, Any],
    current_user: Dict = Depends(get_current_user),
    authorization: str = Header(...)
):
    """
    Crear un nuevo thread en un canal
    Body: {
        "title": "título del thread",
        "content": "contenido",
        "channel_id": "channel-id",
        "author_id": "user-id"
    }
    """
    return await channel_client.post(
        "/v1/threads/",
        json=thread_data,
        headers={"Authorization": authorization}
    )

@router.delete("/threads")
async def delete_thread(
    thread_data: Dict[str, Any],
    current_user: Dict = Depends(get_current_user),
    authorization: str = Header(...)
):
    """
    Eliminar un thread
    Body: {
        "thread_id": "thread-id"
    }
    """
    return await channel_client.delete(
        "/v1/threads/",
        headers={"Authorization": authorization}
    )

@router.get("/{channel_id}/threads")
async def get_channel_threads(
    channel_id: str,
    current_user: Dict = Depends(get_current_user),
    authorization: str = Header(...)
):
    """Obtener todos los threads de un canal"""
    return await channel_client.get(
        f"/v1/threads/channel/{channel_id}",
        headers={"Authorization": authorization}
    )

@router.get("/threads/{thread_id}")
async def get_thread(
    thread_id: str,
    current_user: Dict = Depends(get_current_user),
    authorization: str = Header(...)
):
    """Obtener un thread específico"""
    return await channel_client.get(
        f"/v1/threads/{thread_id}",
        headers={"Authorization": authorization}
    )

@router.get("/health")
async def channels_health():
    """Health check del servicio de canales"""
    return await channel_client.get("/health")
