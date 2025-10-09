from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from uuid import UUID
from .db import get_db
from .models import User
from .auth import decode_token

oauth2_scheme = HTTPBearer(auto_error=True)

def get_current_user(
    db: Session = Depends(get_db),
    creds: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
) -> User:
    token = creds.credentials  # <-- este es el JWT en texto
    try:
        data = decode_token(token)
        uid = data.get("sub")
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

    user = db.get(User, UUID(uid))
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Inactive or missing user")
    return user
