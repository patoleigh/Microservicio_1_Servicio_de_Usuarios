import httpx
from fastapi import HTTPException, status
from typing import Dict, Any, Optional
from ..config import settings

class ServiceClient:
    """Cliente base para comunicación con microservicios"""
    
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def _request(
        self,
        method: str,
        path: str,
        headers: Optional[Dict[str, str]] = None,
        json: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None,
        data: Optional[Any] = None,
    ) -> Dict[str, Any]:
        """Realiza una petición HTTP al microservicio"""
        url = f"{self.base_url}{path}"
        
        try:
            response = await self.client.request(
                method=method,
                url=url,
                headers=headers,
                json=json,
                params=params,
                data=data,
            )
            
            # Si la respuesta no es exitosa, propagar el error
            if response.status_code >= 400:
                try:
                    error_detail = response.json()
                except:
                    error_detail = {"detail": response.text}
                
                raise HTTPException(
                    status_code=response.status_code,
                    detail=error_detail
                )
            
            return response.json()
            
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Service unavailable: {str(e)}"
            )
    
    async def get(self, path: str, headers: Optional[Dict] = None, params: Optional[Dict] = None):
        return await self._request("GET", path, headers=headers, params=params)
    
    async def post(self, path: str, json: Dict, headers: Optional[Dict] = None):
        return await self._request("POST", path, headers=headers, json=json)
    
    async def put(self, path: str, json: Dict, headers: Optional[Dict] = None):
        return await self._request("PUT", path, headers=headers, json=json)
    
    async def patch(self, path: str, json: Dict, headers: Optional[Dict] = None):
        return await self._request("PATCH", path, headers=headers, json=json)
    
    async def delete(self, path: str, headers: Optional[Dict] = None):
        return await self._request("DELETE", path, headers=headers)


# Instancias de clientes para cada microservicio
users_client = ServiceClient(settings.USERS_SERVICE_URL)
channel_client = ServiceClient(settings.CHANNEL_SERVICE_URL)
messages_client = ServiceClient(settings.MESSAGES_SERVICE_URL)
files_client = ServiceClient(settings.FILES_SERVICE_URL)
moderation_client = ServiceClient(settings.MODERATION_SERVICE_URL)
presence_client = ServiceClient(settings.PRESENCE_SERVICE_URL)
search_client = ServiceClient(settings.SEARCH_SERVICE_URL)
