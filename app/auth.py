from datetime import datetime, timedelta, timezone
from typing import Optional
from passlib.context import CryptContext
from jose import jwt, JWTError

from .config import settings

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(p: str) -> str:
    return pwd_ctx.hash(p)

def verify_password(p: str, hashed: str) -> bool:
    return pwd_ctx.verify(p, hashed)

def create_access_token(sub: str, extra: Optional[dict] = None) -> str:
    data = {"sub": sub, "exp": datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRES_MIN)}
    if extra:
        data.update(extra)
    return jwt.encode(data, settings.JWT_SECRET, algorithm=settings.JWT_ALG)

def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALG])
