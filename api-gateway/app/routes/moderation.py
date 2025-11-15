from fastapi import APIRouter, Depends, Header
from typing import Dict, Any, Optional
from ..clients.base import moderation_client
from ..auth import get_current_user, optional_auth

router = APIRouter(prefix="/moderation", tags=["Moderation"])

@router.post("/check")
async def check_content(
    content: Dict[str, Any],
    current_user: Optional[Dict] = Depends(optional_auth)
):
    """
    Verificar toxicidad de contenido
    Body: {"text": "contenido a moderar", "language": "es"}
    
    El servicio usa modelo multilingual Detoxify y retorna:
    - toxicity: 0.0-1.0
    - threshold: low(0.5), medium(0.7), high(0.9)
    - action: "allow", "warn", "block"
    """
    return await moderation_client.post("/api/v1/moderate", json=content)

@router.get("/user/{user_id}/strikes")
async def get_user_strikes(
    user_id: str,
    current_user: Dict = Depends(get_current_user),
    authorization: str = Header(...)
):
    """
    Obtener strikes de un usuario
    
    Sistema de strikes:
    - 3 strikes -> ban temporal (24h)
    - 5 strikes -> ban permanente
    - Strikes se resetean cada 30 días
    """
    return await moderation_client.get(
        f"/api/v1/users/{user_id}/strikes",
        headers={"Authorization": authorization}
    )

@router.get("/blacklist")
async def get_blacklist(current_user: Dict = Depends(get_current_user)):
    """Obtener lista de palabras prohibidas"""
    return await moderation_client.get("/api/v1/blacklist")

@router.post("/blacklist")
async def add_to_blacklist(
    word_data: Dict[str, Any],
    current_user: Dict = Depends(get_current_user),
    authorization: str = Header(...)
):
    """Agregar palabra a blacklist (requiere permisos de admin)"""
    return await moderation_client.post(
        "/api/v1/blacklist",
        json=word_data,
        headers={"Authorization": authorization}
    )

@router.get("/bans")
async def get_active_bans(
    current_user: Dict = Depends(get_current_user),
    authorization: str = Header(...)
):
    """Obtener lista de usuarios baneados"""
    return await moderation_client.get(
        "/api/v1/bans",
        headers={"Authorization": authorization}
    )
