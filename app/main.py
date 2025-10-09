from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from .config import settings
from .routes.users import router as users_router

app = FastAPI(
    title="Users Service",
    version=settings.APP_VERSION,
    description="""
Microservicio de Usuarios.
- Registro y autenticación (JWT).
- Perfil básico (/users/me).
- Emisión de eventos en RabbitMQ (user.created, user.updated).
""",
    contact={"name": "Equipo X", "email": "equipo@example.com"},
    openapi_url="/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

@app.get("/health", tags=["meta"])
def health():
    return {"status": "ok", "service": settings.APP_NAME, "version": settings.APP_VERSION}

# Manejo de errores estandarizado (ejemplo)
@app.exception_handler(Exception)
async def default_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"code":"internal_error","message":"Unexpected server error"})

app.include_router(users_router)
