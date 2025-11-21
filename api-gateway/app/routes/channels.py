from fastapi import APIRouter, Depends, Header, HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from typing import Dict, Any
from ..clients.base import channel_client, threads_client
from ..auth import get_current_user, security

router = APIRouter(prefix="/channels", tags=["Channels"])

# ========== CHANNELS ==========

@router.post("/")
async def create_channel(
    channel_data: Dict[str, Any],
    current_user: Dict = Depends(get_current_user),
    token_creds: HTTPAuthorizationCredentials = Depends(security)
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
        headers={"Authorization": f"Bearer {token_creds.credentials}"}
    )

@router.get("/{channel_id}")
async def get_channel(
    channel_id: str,
    current_user: Dict = Depends(get_current_user),
    token_creds: HTTPAuthorizationCredentials = Depends(security)
):
    """Obtener información de un canal"""
    return await channel_client.get(
        f"/v1/channels/{channel_id}",
        headers={"Authorization": f"Bearer {token_creds.credentials}"}
    )

@router.get("/{channel_id}/basic")
async def get_channel_basic(
    channel_id: str,
    current_user: Dict = Depends(get_current_user),
    token_creds: HTTPAuthorizationCredentials = Depends(security)
):
    """Obtener información básica de un canal"""
    return await channel_client.get(
        f"/v1/channels/{channel_id}/basic",
        headers={"Authorization": f"Bearer {token_creds.credentials}"}
    )

@router.put("/{channel_id}")
async def update_channel(
    channel_id: str,
    channel_data: Dict[str, Any],
    current_user: Dict = Depends(get_current_user),
    token_creds: HTTPAuthorizationCredentials = Depends(security)
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
        headers={"Authorization": f"Bearer {token_creds.credentials}"}
    )

@router.delete("/{channel_id}")
async def delete_channel(
    channel_id: str,
    current_user: Dict = Depends(get_current_user),
    token_creds: HTTPAuthorizationCredentials = Depends(security)
):
    """Eliminar (desactivar) un canal"""
    return await channel_client.delete(
        f"/v1/channels/{channel_id}",
        headers={"Authorization": f"Bearer {token_creds.credentials}"}
    )

@router.post("/{channel_id}/reactivate")
async def reactivate_channel(
    channel_id: str,
    current_user: Dict = Depends(get_current_user),
    token_creds: HTTPAuthorizationCredentials = Depends(security)
):
    """Reactivar un canal eliminado"""
    return await channel_client.post(
        f"/v1/channels/{channel_id}/reactivate",
        json={},
        headers={"Authorization": f"Bearer {token_creds.credentials}"}
    )

# ========== MEMBERS ==========

@router.post("/members")
async def add_member(
    member_data: Dict[str, Any],
    current_user: Dict = Depends(get_current_user),
    token_creds: HTTPAuthorizationCredentials = Depends(security)
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
        headers={"Authorization": f"Bearer {token_creds.credentials}"}
    )

@router.delete("/members")
async def remove_member(
    member_data: Dict[str, Any],
    current_user: Dict = Depends(get_current_user),
    token_creds: HTTPAuthorizationCredentials = Depends(security)
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
        headers={"Authorization": f"Bearer {token_creds.credentials}"}
    )

@router.get("/members/user/{user_id}")
async def get_user_channels(
    user_id: str,
    current_user: Dict = Depends(get_current_user),
    token_creds: HTTPAuthorizationCredentials = Depends(security)
):
    """Obtener todos los canales de un usuario"""
    return await channel_client.get(
        f"/v1/members/{user_id}",
        headers={"Authorization": f"Bearer {token_creds.credentials}"}
    )

@router.get("/members/owner/{owner_id}")
async def get_owned_channels(
    owner_id: str,
    current_user: Dict = Depends(get_current_user),
    token_creds: HTTPAuthorizationCredentials = Depends(security)
):
    """Obtener canales donde el usuario es owner"""
    return await channel_client.get(
        f"/v1/members/owner/{owner_id}",
        headers={"Authorization": f"Bearer {token_creds.credentials}"}
    )

@router.get("/{channel_id}/members")
async def get_channel_members(
    channel_id: str,
    current_user: Dict = Depends(get_current_user),
    token_creds: HTTPAuthorizationCredentials = Depends(security)
):
    """Obtener todos los miembros de un canal"""
    return await channel_client.get(
        f"/v1/members/channel/{channel_id}",
        headers={"Authorization": f"Bearer {token_creds.credentials}"}
    )

# ========== THREADS ==========

@router.post("/threads")
async def create_thread(
    thread_data: Dict[str, Any],
    current_user: Dict = Depends(get_current_user),
    token_creds: HTTPAuthorizationCredentials = Depends(security)
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
    channel_id = str(thread_data.get("channel_id"))
    
    # Validar que el canal existe en el servicio de channels
    try:
        channel = await channel_client.get(
            f"/v1/channels/{channel_id}",
            headers={"Authorization": f"Bearer {token_creds.credentials}"}
        )
        # Verificar que el canal está activo
        if not channel.get("is_active", True):
            raise HTTPException(
                status_code=400,
                detail="Channel is not active"
            )
    except HTTPException as e:
        if e.status_code == 404:
            raise HTTPException(
                status_code=404,
                detail="Channel not found"
            )
        raise
    
    # Adaptar el body para el threads-service
    # El threads-service espera: channel_id, title, created_by
    payload = {
        "channel_id": channel_id,
        "title": thread_data.get("title"),
        "created_by": str(thread_data.get("author_id", current_user.get("id"))),
        "meta": {}
    }
    
    return await threads_client.post(
        "/v1",
        json=payload,
        headers={"Authorization": f"Bearer {token_creds.credentials}"}
    )

@router.delete("/threads")
async def delete_thread(
    thread_data: Dict[str, Any],
    current_user: Dict = Depends(get_current_user),
    token_creds: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Eliminar un thread
    Body: {
        "thread_id": "thread-id"
    }
    """
    thread_id = thread_data.get("thread_id")
    return await threads_client.delete(
        f"/v1/{thread_id}",
        headers={"Authorization": f"Bearer {token_creds.credentials}"}
    )

@router.get("/{channel_id}/threads")
async def get_channel_threads(
    channel_id: str,
    current_user: Dict = Depends(get_current_user),
    token_creds: HTTPAuthorizationCredentials = Depends(security)
):
    """Obtener todos los threads de un canal"""
    return await threads_client.get(
        "/v1",
        params={"channel_id": channel_id},
        headers={"Authorization": f"Bearer {token_creds.credentials}"}
    )

@router.get("/threads/{thread_id}")
async def get_thread(
    thread_id: str,
    current_user: Dict = Depends(get_current_user),
    token_creds: HTTPAuthorizationCredentials = Depends(security)
):
    """Obtener un thread específico"""
    return await threads_client.get(
        f"/v1/{thread_id}",
        headers={"Authorization": f"Bearer {token_creds.credentials}"}
    )

@router.get("/health")
async def channels_health():
    """Health check del servicio de canales"""
    return await channel_client.get("/health")
