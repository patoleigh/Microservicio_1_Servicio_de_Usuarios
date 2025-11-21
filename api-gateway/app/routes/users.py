from fastapi import APIRouter, Depends, Header
from fastapi.security import HTTPAuthorizationCredentials
from typing import Dict, Any, Optional
from ..clients.base import users_client
from ..auth import get_current_user, optional_auth, security

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
    token_creds: HTTPAuthorizationCredentials = Depends(security)
):
    """Obtener perfil del usuario actual"""
    return await users_client.get(
        "/usersservice/v1/users/me",
        headers={"Authorization": f"Bearer {token_creds.credentials}"}
    )

@router.patch("/me")
async def update_me(
    user_data: Dict[str, Any],
    current_user: Dict = Depends(get_current_user),
    token_creds: HTTPAuthorizationCredentials = Depends(security)
):
    """Actualizar perfil del usuario actual"""
    return await users_client.patch(
        "/usersservice/v1/users/me",
        json=user_data,
        headers={"Authorization": f"Bearer {token_creds.credentials}"}
    )

@router.get("/health")
async def users_health():
    """Health check del servicio de usuarios"""
    return await users_client.get("/usersservice/health")
