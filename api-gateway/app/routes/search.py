from fastapi import APIRouter, Depends, Query
from typing import Dict, Any, Optional
from ..clients.base import search_client
from ..auth import optional_auth

router = APIRouter(prefix="/search", tags=["Search"])

@router.get("/messages")
async def search_messages(
    q: str = Query(..., description="Término de búsqueda"),
    current_user: Optional[Dict] = Depends(optional_auth)
):
    """Búsqueda de mensajes"""
    return await search_client.get("/api/message/search_message", params={"q": q})

@router.get("/files")
async def search_files(
    q: str = Query(..., description="Término de búsqueda"),
    current_user: Optional[Dict] = Depends(optional_auth)
):
    """Búsqueda de archivos"""
    return await search_client.get("/api/files/search_files", params={"q": q})

@router.get("/channels")
async def search_channels(
    q: str = Query(..., description="Término de búsqueda"),
    current_user: Optional[Dict] = Depends(optional_auth)
):
    """Búsqueda de canales"""
    return await search_client.get("/api/channel/search_channel", params={"q": q})

@router.get("/threads/id/{thread_id}")
async def get_thread_by_id(
    thread_id: str,
    current_user: Optional[Dict] = Depends(optional_auth)
):
    """Obtener thread por ID"""
    return await search_client.get(f"/api/threads/id/{thread_id}")

@router.get("/threads/author/{author}")
async def search_threads_by_author(
    author: str,
    current_user: Optional[Dict] = Depends(optional_auth)
):
    """Buscar threads por autor"""
    return await search_client.get(f"/api/threads/author/{author}")

@router.get("/threads/keyword/{keyword}")
async def search_threads_by_keyword(
    keyword: str,
    current_user: Optional[Dict] = Depends(optional_auth)
):
    """Buscar threads por palabra clave"""
    return await search_client.get(f"/api/threads/keyword/{keyword}")

@router.get("/threads/status/{status}")
async def search_threads_by_status(
    status: str,
    current_user: Optional[Dict] = Depends(optional_auth)
):
    """Buscar threads por estado"""
    return await search_client.get(f"/api/threads/status/{status}")

@router.get("/threads/daterange")
async def search_threads_by_daterange(
    start_date: str,
    end_date: str,
    current_user: Optional[Dict] = Depends(optional_auth)
):
    """Buscar threads por rango de fechas"""
    return await search_client.get(
        "/api/threads/daterange",
        params={"start_date": start_date, "end_date": end_date}
    )

@router.get("/health")
async def search_health():
    """Health check del servicio de búsqueda"""
    return await search_client.get("/api/healthz")
