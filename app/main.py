from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import os

from .config import settings
from .routes.users import router as users_router
from .db import Base, engine
from . import models  # noqa: F401  # asegura que los modelos se registren en Base.metadata


# root_path para que Swagger UI funcione correctamente detrás de un proxy con path prefix.
# Si se accede vía /usersservice, puedes definir ROOT_PATH=/usersservice en el entorno
# o bien utilizar el header X-Forwarded-Prefix en el proxy.
root_path = os.getenv("ROOT_PATH", "")

app = FastAPI(
    title="Users Service",
    version=settings.APP_VERSION,
    description=(
        "Microservicio de Usuarios.\n"
        "- Registro y autenticación (JWT).\n"
        "- Consulta y actualización del perfil del usuario.\n"
    ),
    root_path=root_path or "",
)

@app.middleware("http")
async def forwarded_prefix_middleware(request: Request, call_next):
    """Ajusta el root_path a partir del header X-Forwarded-Prefix si existe.

    Útil cuando el servicio está publicado detrás de un API Gateway o Ingress
    bajo un path como /usersservice.
    """
    forwarded_prefix = request.headers.get("X-Forwarded-Prefix")
    if forwarded_prefix:
        request.scope["root_path"] = forwarded_prefix
    response = await call_next(request)
    return response

@app.get("/health", tags=["meta"])
def health():
    return {
        "status": "ok",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }


@app.exception_handler(Exception)
async def default_handler(request: Request, exc: Exception):
    # Aquí podrías loguear la excepción antes de responder.
    return JSONResponse(
        status_code=500,
        content={
            "code": "internal_error",
            "message": "Unexpected server error",
        },
    )


# Rutas del dominio de usuarios
app.include_router(users_router)
