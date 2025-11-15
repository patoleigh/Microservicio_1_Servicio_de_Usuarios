from fastapi import APIRouter, Depends, Header
from typing import Dict, Any
from ..clients.base import messages_client
from ..auth import get_current_user

router = APIRouter(prefix="/messages", tags=["Messages"])

@router.post("/threads/{thread_id}")
async def send_message(
    thread_id: str,
    message_data: Dict[str, Any],
    current_user: Dict = Depends(get_current_user),
    authorization: str = Header(...)
):
    """
    Enviar mensaje a un thread
    Body: {
        "content": "texto del mensaje",
        "author": "user-id"
    }
    """
    return await messages_client.post(
        f"/threads/{thread_id}/messages",
        json=message_data,
        headers={"Authorization": authorization}
    )

@router.get("/threads/{thread_id}")
async def get_thread_messages(
    thread_id: str,
    current_user: Dict = Depends(get_current_user),
    authorization: str = Header(...)
):
    """Obtener todos los mensajes de un thread"""
    return await messages_client.get(
        f"/threads/{thread_id}/messages",
        headers={"Authorization": authorization}
    )

@router.put("/threads/{thread_id}/messages/{message_id}")
async def update_message(
    thread_id: str,
    message_id: str,
    message_data: Dict[str, Any],
    current_user: Dict = Depends(get_current_user),
    authorization: str = Header(...)
):
    """
    Actualizar un mensaje específico
    Body: {
        "content": "nuevo contenido"
    }
    """
    return await messages_client.put(
        f"/threads/{thread_id}/messages/{message_id}",
        json=message_data,
        headers={"Authorization": authorization}
    )

@router.delete("/threads/{thread_id}/messages/{message_id}")
async def delete_message(
    thread_id: str,
    message_id: str,
    current_user: Dict = Depends(get_current_user),
    authorization: str = Header(...)
):
    """Eliminar un mensaje específico"""
    return await messages_client.delete(
        f"/threads/{thread_id}/messages/{message_id}",
        headers={"Authorization": authorization}
    )
