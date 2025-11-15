from fastapi import APIRouter, Depends, Header
from typing import Dict, Any, Optional
from ..clients.base import users_client
from ..auth import get_current_user, optional_auth

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/register")
async def register(user_data: Dict[str, Any]):
    """Registro de nuevo usuario"""
    return await users_client.post("/usersservice/v1/users/register", json=user_data)

@router.post("/login")
async def login(credentials: Dict[str, Any]):
    """Login de usuario"""
    return await users_client.post("/usersservice/v1/auth/login", json=credentials)

@router.get("/me")
async def get_me(
    current_user: Dict = Depends(get_current_user),
    authorization: str = Header(...)
):
    """Obtener perfil del usuario actual"""
    return await users_client.get(
        "/usersservice/v1/users/me",
        headers={"Authorization": authorization}
    )

@router.patch("/me")
async def update_me(
    user_data: Dict[str, Any],
    current_user: Dict = Depends(get_current_user),
    authorization: str = Header(...)
):
    """Actualizar perfil del usuario actual"""
    return await users_client.patch(
        "/usersservice/v1/users/me",
        json=user_data,
        headers={"Authorization": authorization}
    )

@router.get("/health")
async def users_health():
    """Health check del servicio de usuarios"""
    return await users_client.get("/usersservice/health")
