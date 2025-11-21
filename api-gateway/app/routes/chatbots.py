from fastapi import APIRouter, Depends, Header
from typing import Dict, Any, Optional
from ..clients.base import wikipedia_client, chatbot_prog_client
from ..auth import get_current_user, optional_auth

router = APIRouter(prefix="/chatbots", tags=["Chatbots"])

# ========== WIKIPEDIA CHATBOT ==========

@router.post("/wikipedia/query")
async def wikipedia_query(
    query_data: Dict[str, Any],
    current_user: Optional[Dict] = Depends(optional_auth)
):
    """
    Consultar Wikipedia Chatbot
    Body: {
        "question": "tu pregunta aquí",
        "language": "es" (opcional, por defecto es)
    }
    El servicio espera POST /chat-wikipedia con { message }
    """
    # Transform frontend payload to service format
    payload = {}
    if "question" in query_data:
        payload["message"] = query_data["question"]
    elif "message" in query_data:
        payload["message"] = query_data["message"]
    else:
        payload = query_data
    
    response = await wikipedia_client.post(
        "/chat-wikipedia",
        json=payload
    )
    
    # Normalize response: service returns { message }, frontend expects { answer }
    if isinstance(response, dict) and "message" in response:
        return {"answer": response["message"]}
    return response

@router.get("/wikipedia/health")
async def wikipedia_health():
    """Health check del chatbot de Wikipedia"""
    return await wikipedia_client.get("/health")

# ========== PROGRAMMING CHATBOT ==========

@router.post("/programming/chat")
async def programming_chat(
    payload: Dict[str, Any],
    current_user: Optional[Dict] = Depends(optional_auth)
):
    """
    Consultar Chatbot de Programación (ruta correcta)
    Body: {
        "message": "tu pregunta de programación aquí",
        "context": "contexto adicional" (opcional)
    }
    Real service expects POST /chat with { message }
    """
    # Ensure 'message' key for real service
    data = {}
    if "message" in payload:
        data["message"] = payload["message"]
    elif "question" in payload:
        # fallback if frontend sends 'question'
        data["message"] = payload["question"]
    else:
        data = payload
    
    response = await chatbot_prog_client.post("/chat", json=data)
    
    # Normalize response: service returns { reply }, frontend expects { answer }
    if isinstance(response, dict) and "reply" in response:
        return {"answer": response["reply"]}
    return response

@router.post("/programming/query")
async def programming_query_legacy(
    query_data: Dict[str, Any],
    current_user: Optional[Dict] = Depends(optional_auth)
):
    """
    Legacy endpoint (deprecated): redirige a /programming/chat
    """
    payload = {}
    if "question" in query_data:
        payload["message"] = query_data["question"]
    if "context" in query_data:
        payload["context"] = query_data["context"]
    return await programming_chat(payload, current_user)

@router.get("/programming/health")
async def programming_health():
    """Health check del chatbot de programación"""
    return await chatbot_prog_client.get("/health")
