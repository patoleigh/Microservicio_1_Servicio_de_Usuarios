from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from .config import settings
from .routes.users import router as users_router
import os

# root_path para que Swagger UI funcione correctamente detrás de un proxy con path prefix
# Si se accede via /usersservice, FastAPI ajustará automáticamente las URLs
root_path = os.getenv("ROOT_PATH", "")

app = FastAPI(
    title="Users Service",
    version=settings.APP_VERSION,
    description="""
Microservicio de Usuarios.
- Registro y autenticación (JWT).
- Perfil básico (/users/me).
- Emisión de eventos en RabbitMQ (user.created, user.updated).
""",
    root_path=root_path,
)

# Middleware para manejar X-Forwarded-Prefix de nginx-ingress
@app.middleware("http")
async def add_root_path_middleware(request: Request, call_next):
    # Si nginx-ingress envía X-Forwarded-Prefix, lo usamos como root_path
    forwarded_prefix = request.headers.get("X-Forwarded-Prefix", "")
    if forwarded_prefix and not root_path:
        request.scope["root_path"] = forwarded_prefix
    response = await call_next(request)
    return response

@app.get("/health", tags=["meta"])
def health():
    return {"status": "ok", "service": settings.APP_NAME, "version": settings.APP_VERSION}

# Manejo de errores estandarizado (ejemplo)
@app.exception_handler(Exception)
async def default_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"code":"internal_error","message":"Unexpected server error"})

app.include_router(users_router)
