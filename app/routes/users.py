from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi.responses import JSONResponse

from ..db import get_db
from ..models import User
from ..schemas import (
    UserRegisterIn,
    UserLoginIn,
    UserUpdateIn,
    UserOut,
    TokenOut,
    ErrorOut,
)
from ..auth import hash_password, verify_password, create_access_token
from ..events import publish_user_event
from ..deps import get_current_user

router = APIRouter(prefix="/v1", tags=["users"])

# Mantén este valor en sync con la expiración que uses en create_access_token()
TOKEN_TTL_SECONDS = 60 * 60  # 1 hora


@router.post(
    "/users/register",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED,
    responses={409: {"model": ErrorOut}},
)
async def register(body: UserRegisterIn, db: Session = Depends(get_db)):
    # Unicidad por email o username
    exists = db.execute(
        select(User).where((User.email == body.email) | (User.username == body.username))
    ).scalar_one_or_none()
    if exists:
        raise HTTPException(status_code=409, detail="email or username already exists")

    u = User(
        email=body.email,
        username=body.username,
        full_name=body.full_name,
        password_hash=hash_password(body.password),
    )
    db.add(u)
    db.commit()
    db.refresh(u)

    # Evento de dominio
    await publish_user_event(
        "user.created",
        {"email": u.email, "username": u.username, "full_name": u.full_name},
        str(u.id),
    )

    return u


@router.post(
    "/auth/login",
    response_model=TokenOut,
    responses={401: {"model": ErrorOut}},
)
def login(body: UserLoginIn, db: Session = Depends(get_db)):
    u = db.execute(
        select(User).where(
            (User.username == body.username_or_email)
            | (User.email == body.username_or_email)
        )
    ).scalar_one_or_none()

    if not u or not verify_password(body.password, u.password_hash):
        raise HTTPException(status_code=401, detail="invalid credentials")

    token = create_access_token(sub=str(u.id), extra={"username": u.username})

    return JSONResponse(
        content={
            "access_token": token,
            "token_type": "bearer",
            "expires_in": 3600,  # o el valor real que uses
        },
        status_code=status.HTTP_200_OK,
    )

@router.get("/users/me", response_model=UserOut)
def me(current: User = Depends(get_current_user)):
    return current


@router.patch("/users/me", response_model=UserOut)
async def update_me(
    body: UserUpdateIn,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    if body.full_name is not None:
        current.full_name = body.full_name

    db.add(current)
    db.commit()
    db.refresh(current)

    # Evento de dominio
    await publish_user_event(
        "user.updated",
        {"full_name": current.full_name},
        str(current.id),
    )

    return current
