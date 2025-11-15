from fastapi import APIRouter, Depends, Header, UploadFile, File
from typing import Dict, Any, Optional
from ..clients.base import ServiceClient
from ..auth import get_current_user
from ..config import settings

# Cliente para el servicio de archivos
# Nota: El servicio de archivos está en file-service namespace
files_client = ServiceClient("http://file-service-api.file-service.svc.cluster.local:80")

router = APIRouter(prefix="/files", tags=["Files"])

@router.post("/")
async def upload_file(
    file_data: Dict[str, Any],
    current_user: Dict = Depends(get_current_user),
    authorization: str = Header(...)
):
    """
    Subir un archivo
    Body: {
        "filename": "nombre.ext",
        "content_type": "image/png",
        "size": 1024,
        "metadata": {}
    }
    """
    return await files_client.post(
        "/v1/files",
        json=file_data,
        headers={"Authorization": authorization}
    )

@router.get("/")
async def list_files(
    current_user: Dict = Depends(get_current_user),
    authorization: str = Header(...)
):
    """Obtener lista de archivos"""
    return await files_client.get(
        "/v1/files",
        headers={"Authorization": authorization}
    )

@router.get("/{file_id}")
async def get_file(
    file_id: str,
    current_user: Dict = Depends(get_current_user),
    authorization: str = Header(...)
):
    """Obtener información de un archivo"""
    return await files_client.get(
        f"/v1/files/{file_id}",
        headers={"Authorization": authorization}
    )

@router.post("/{file_id}/download")
async def get_download_url(
    file_id: str,
    current_user: Dict = Depends(get_current_user),
    authorization: str = Header(...)
):
    """
    Obtener URL de descarga pre-firmada
    Retorna una URL temporal para descargar el archivo
    """
    return await files_client.post(
        f"/v1/files/{file_id}/presign-download",
        json={},
        headers={"Authorization": authorization}
    )

@router.delete("/{file_id}")
async def delete_file(
    file_id: str,
    current_user: Dict = Depends(get_current_user),
    authorization: str = Header(...)
):
    """Eliminar un archivo"""
    return await files_client.delete(
        f"/v1/files/{file_id}",
        headers={"Authorization": authorization}
    )

@router.get("/health")
async def files_health():
    """Health check del servicio de archivos"""
    return await files_client.get("/healthz")
