from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from uuid import UUID

# Requests
class UserRegisterIn(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=8)
    full_name: Optional[str] = None

class UserLoginIn(BaseModel):
    username_or_email: str
    password: str

class UserUpdateIn(BaseModel):
    full_name: Optional[str] = None

# Responses
class UserOut(BaseModel):
    id: UUID
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

# Error schema (estandarizado)
class ErrorOut(BaseModel):
    code: str
    message: str
    details: Optional[dict] = None
