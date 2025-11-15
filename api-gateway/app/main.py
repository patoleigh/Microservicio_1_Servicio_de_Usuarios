from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .routes import users, moderation, presence, search, messages, files, channels
import os

# root_path para que funcione detrás de un path prefix en Ingress
root_path = os.getenv("ROOT_PATH", "")

app = FastAPI(
    title="Student Messaging API Gateway",
    version=settings.APP_VERSION,
    description="""
API Gateway para sistema de mensajería de estudiantes de Ingeniería Civil Informática.

## Servicios Integrados:
- **Users**: Autenticación y perfiles de usuario
- **Channels**: Gestión de canales, miembros y threads
- **Messages**: Sistema de mensajería (threads y mensajes)
- **Files**: Gestión de archivos (upload/download con MinIO)
- **Moderation**: Moderación de contenido
- **Presence**: Estado online/offline de usuarios
- **Search**: Búsqueda de contenido (mensajes, archivos, threads, canales)

## Autenticación:
La mayoría de endpoints requieren un token JWT en el header:
```
Authorization: Bearer <token>
```

Obtén el token haciendo login en `/users/login`.
""",
    root_path=root_path,
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especifica los dominios permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check del API Gateway
@app.get("/health", tags=["Gateway"])
def health():
    return {
        "status": "ok",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENV
    }

@app.get("/", tags=["Gateway"])
def root():
    return {
        "message": "Student Messaging API Gateway",
        "version": settings.APP_VERSION,
        "docs": f"{root_path}/docs" if root_path else "/docs"
    }

# Registrar rutas de microservicios
app.include_router(users.router)
app.include_router(messages.router)
app.include_router(files.router)
app.include_router(moderation.router)
app.include_router(presence.router)
app.include_router(search.router)
app.include_router(channels.router)
