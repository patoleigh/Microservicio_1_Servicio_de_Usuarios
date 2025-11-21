from fastapi import Header, HTTPException, status
from jose import JWTError, jwt
from typing import Optional
from .config import settings

from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Depends

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Dependency para extraer y validar el JWT token.
    Retorna el payload del token si es válido.
    """
    token = credentials.credentials
    
    try:
        # Decodificar y validar el JWT
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALG]
        )
        
        return payload
        
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )


def optional_auth(authorization: Optional[str] = Header(None)):
    """
    Dependency para autenticación opcional.
    Retorna el payload si hay token, None si no hay.
    """
    if not authorization:
        return None
    
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            return None
        
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALG]
        )
        return payload
    except:
        return None
