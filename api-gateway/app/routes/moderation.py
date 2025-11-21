from fastapi import APIRouter, Depends, Header
from fastapi.security import HTTPAuthorizationCredentials
from typing import Dict, Any, Optional
from ..clients.base import moderation_client
from ..auth import get_current_user, optional_auth, security

router = APIRouter(prefix="/moderation", tags=["Moderation"])

@router.post("/check")
async def check_content(
    content: Dict[str, Any],
    current_user: Optional[Dict] = Depends(optional_auth)
):
    """
    Verificar toxicidad de contenido
    Body: {
        "content": "contenido a moderar",
        "message_id": "msg-id",
        "user_id": "user-id",
        "channel_id": "channel-id"
    }
    """
    return await moderation_client.post("/api/v1/moderation/check", json=content)

@router.get("/status/{user_id}/{channel_id}")
async def get_user_moderation_status(
    user_id: str,
    channel_id: str,
    current_user: Dict = Depends(get_current_user),
    token_creds: HTTPAuthorizationCredentials = Depends(security)
):
    """Obtener estado de moderación de un usuario en un canal"""
    return await moderation_client.get(
        f"/api/v1/moderation/status/{user_id}/{channel_id}",
        headers={"Authorization": f"Bearer {token_creds.credentials}"}
    )

@router.get("/blacklist")
async def get_blacklist(
    current_user: Dict = Depends(get_current_user),
    limit: int = 50,
    skip: int = 0
):
    """Obtener lista de palabras prohibidas"""
    return await moderation_client.get(
        "/api/v1/blacklist/words",
        params={"limit": limit, "skip": skip}
    )

@router.post("/blacklist")
async def add_to_blacklist(
    word_data: Dict[str, Any],
    current_user: Dict = Depends(get_current_user),
    token_creds: HTTPAuthorizationCredentials = Depends(security)
):
    """Agregar palabra a blacklist (requiere permisos de admin)"""
    return await moderation_client.post(
        "/api/v1/blacklist/words",
        json=word_data,
        headers={"Authorization": f"Bearer {token_creds.credentials}"}
    )

@router.delete("/blacklist/{word_id}")
async def remove_from_blacklist(
    word_id: str,
    current_user: Dict = Depends(get_current_user),
    token_creds: HTTPAuthorizationCredentials = Depends(security)
):
    """Eliminar palabra de blacklist"""
    return await moderation_client.delete(
        f"/api/v1/blacklist/words/{word_id}",
        headers={"Authorization": f"Bearer {token_creds.credentials}"}
    )

@router.get("/admin/banned-users")
async def get_banned_users(
    channel_id: Optional[str] = None,
    current_user: Dict = Depends(get_current_user),
    token_creds: HTTPAuthorizationCredentials = Depends(security)
):
    """Obtener lista de usuarios baneados"""
    params = {}
    if channel_id:
        params["channel_id"] = channel_id
    return await moderation_client.get(
        "/api/v1/admin/banned-users",
        params=params,
        headers={"Authorization": f"Bearer {token_creds.credentials}"}
    )
