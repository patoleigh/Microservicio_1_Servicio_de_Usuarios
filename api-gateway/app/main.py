from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .routes import users, moderation, presence, search, messages, files, channels, chatbots
import os

# root_path para que funcione detrás de un path prefix en Ingress
root_path = os.getenv("ROOT_PATH", "")

app = FastAPI(
    title="Student Messaging API Gateway - Grupo 1",
    version=settings.APP_VERSION,
    description="""
# API Gateway Unificado - Sistema de Mensajería Estudiantil

**Grupo 1 - Ingeniería Civil Informática - INF326**

Este API Gateway integra **9 microservicios** de diferentes grupos para proporcionar
una plataforma completa de mensajería y colaboración para estudiantes.

## 🔐 Autenticación

La mayoría de endpoints requieren un token JWT:
```
Authorization: Bearer <token>
```

**Login:** `POST /users/login` con `{ "email": "...", "password": "..." }`

---

## 📦 Servicios Integrados

### 👥 Users Service (Grupo 1)
- Autenticación (login/register)
- Gestión de perfiles de usuario
- Validación de tokens JWT

### 💬 Messages Service
- Crear/editar/eliminar mensajes en threads
- Paginación con cursor
- Soporta texto, audio y archivos
- **Header requerido:** `X-User-Id`

### 📁 Files Service
- Upload de archivos (MinIO/S3)
- Presigned URLs para descarga
- Asociar archivos a mensajes o threads
- Metadatos y checksums SHA256

### 📢 Channels Service
- Crear/editar/eliminar canales
- Gestión de miembros (roles: member/admin/owner)
- Threads dentro de canales
- Información básica de canales

### 🛡️ Moderation Service
- Detección de toxicidad con IA (Detoxify)
- Sistema de strikes y baneos
- Blacklist de palabras
- Endpoints públicos y admin (requiere `X-API-Key`)

### 👁️ Presence Service
- Estado online/offline/away
- Heartbeat automático (60s timeout)
- Estadísticas de presencia
- Eventos vía RabbitMQ

### 🔍 Search Service
- Búsqueda en mensajes, archivos, threads y canales
- Búsqueda por categoría, autor, tags
- Powered by Elasticsearch

### 🤖 Wikipedia Chatbot
- Consultas a Wikipedia
- Soporte multilenguaje

### 💻 Programming Chatbot
- Asistente para preguntas de programación
- Contexto adicional opcional

---

## 📋 Endpoints Principales

- `/users/*` - Gestión de usuarios
- `/messages/*` - Sistema de mensajería
- `/files/*` - Gestión de archivos
- `/channels/*` - Canales y miembros
- `/moderation/*` - Moderación de contenido
- `/presence/*` - Estado de usuarios
- `/search/*` - Búsqueda global
- `/chatbots/*` - Asistentes virtuales

---

## 🔗 URLs de Servicios Externos

Este gateway se comunica con los siguientes microservicios:

- **Users:** https://users.inf326.nursoft.dev
- **Channels:** https://channel-api.inf326.nur.dev
- **Messages:** https://messages-service.kroder.dev
- **Moderation:** https://moderation.inf326.nur.dev
- **Presence:** https://presence-134-199-176-197.nip.io
- **Search:** https://searchservice.inf326.nursoft.dev
- **Files:** http://file-service-134-199-176-197.nip.io
- **Wikipedia Bot:** http://wikipedia-chatbot-134-199-176-197.nip.io
- **Programming Bot:** https://chatbotprogra.inf326.nursoft.dev
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
app.include_router(chatbots.router)
