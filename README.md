# Users Service (Microservicio 1)

Microservicio responsable de **Registro**, **Autenticación (JWT)** y **Perfil básico** de usuarios.  
Emite **eventos de dominio** a RabbitMQ en cada transacción relevante:

- `user.created`
- `user.updated`

---

## Tabla de contenido

- [Stack](#stack)
- [Arquitectura y responsabilidades](#arquitectura-y-responsabilidades)
- [Estructura del repositorio](#estructura-del-repositorio)
- [API v1 (contratos)](#api-v1-contratos)
  - [`POST /v1/users/register`](#post-v1usersregister)
  - [`POST /v1/auth/login`](#post-v1authlogin)
  - [`GET /v1/users/me`](#get-v1usersme)
  - [`PATCH /v1/users/me`](#patch-v1usersme)
  - [Esquemas de respuesta](#esquemas-de-respuesta)
- [Modelos y esquemas](#modelos-y-esquemas)
- [Eventos](#eventos)
- [Variables de entorno](#variables-de-entorno)
- [Cómo correr (local con entorno virtual)](#cómo-correr-local-con-entorno-virtual)
- [Cómo correr (Docker)](#cómo-correr-docker)
- [Migraciones](#migraciones)
- [Manejo de errores](#manejo-de-errores)
- [Observabilidad y salud](#observabilidad-y-salud)
- [Roadmap](#roadmap)


---

## Stack

- **FastAPI** + Uvicorn  
- **PostgreSQL** + SQLAlchemy + Alembic  
- **JWT (OAuth2 password flow)** con passlib/bcrypt  
- **RabbitMQ** (topic exchange) con aio-pika  
- **Docker / docker-compose**

---

## Arquitectura y responsabilidades

- **Dominio:** usuarios  
- **Persistencia:** tabla `users`  
- **Eventos:** publicados en `users.events` (tipo topic) con ruteo `user.created` / `user.updated`  
- **Seguridad:** JWT con expiración configurable y contraseñas hasheadas (bcrypt)  
- **Versionado:** prefijo `/v1` en rutas; futuras versiones se publican como `/v2`

---

## Estructura del repositorio

```txt
users-service/
├─ app/
│  ├─ main.py
│  ├─ config.py
│  ├─ db.py
│  ├─ models.py
│  ├─ schemas.py
│  ├─ auth.py
│  ├─ events.py
│  ├─ deps.py
│  └─ routes/
│     └─ users.py
├─ alembic/
│  ├─ env.py
│  └─ versions/  (migraciones)
├─ Dockerfile
├─ docker-compose.yml
├─ requirements.txt
├─ .env.example
└─ README.md
```

---

## API v1 (contratos)

> Base URL: `http://localhost:8000`

### `POST /v1/users/register`

**Body**
```json
{
  "email": "a@b.cl",
  "username": "alice",
  "password": "S3gura123",
  "full_name": "Alice Doe"
}
```

**Responses**
- `201` → `UserOut`
- `409` → `ErrorOut` (email o username ya existen)

---

### `POST /v1/auth/login`

**Body**
```json
{
  "username_or_email": "alice",
  "password": "S3gura123"
}
```

**Responses**
- `200` → `TokenOut { "access_token": "...", "token_type": "bearer" }`
- `401` → `ErrorOut` (credenciales inválidas)

---

### `GET /v1/users/me`

> Requiere **Bearer JWT** en `Authorization`.

**Responses**
- `200` → `UserOut`
- `401` → `ErrorOut`

---

### `PATCH /v1/users/me`

> Requiere **Bearer JWT** en `Authorization`.

**Body**
```json
{ "full_name": "Alice D." }
```

**Responses**
- `200` → `UserOut`
- `401` → `ErrorOut`

---

### Esquemas de respuesta

```json
UserOut: {
  "id": "uuid",
  "email": "a@b.cl",
  "username": "alice",
  "full_name": "Alice Doe",
  "is_active": true
}
```

```json
ErrorOut: {
  "code": "string",
  "message": "string",
  "details": { "optional": "object" }
}
```

---

## Modelos y esquemas

- **Modelo SQLAlchemy:** `User`
  - `id (UUID)`
  - `email`
  - `username`
  - `password_hash`
  - `full_name`
  - `is_active`
  - `created_at`
  - `updated_at`

- **Pydantic:**
  - `UserRegisterIn`
  - `UserLoginIn`
  - `UserUpdateIn`
  - `UserOut`
  - `TokenOut`
  - `ErrorOut`

---

## Eventos

- **Exchange:** `users.events` (tipo **topic**, durable)  
- **Routing keys:**
  - `user.created`
  - `user.updated`

**Ejemplo de mensaje**
```json
{
  "type": "user.created",
  "version": "1.0",
  "source": "users-service",
  "user_id": "6d9e4c9c-9d0a-4f6f-9a5f-3f2b9c7e1a2d",
  "payload": {
    "email": "a@b.cl",
    "username": "alice",
    "full_name": "Alice Doe"
  }
}
```

> **Nota:** Para producción se recomienda el **Transactional Outbox Pattern** para asegurar entrega confiable y atómica respecto a la base de datos.

---

## Variables de entorno

Copia `.env.example` a `.env` y ajusta los valores según tu entorno.

```env
APP_NAME=users-service
APP_VERSION=v1
ENV=dev

DATABASE_URL=postgresql+psycopg2://postgres:postgres@db:5432/usersdb

JWT_SECRET=supersecret-change-me
JWT_ALG=HS256
JWT_EXPIRES_MIN=60

RABBITMQ_URL=amqp://guest:guest@mq:5672/
RABBITMQ_EXCHANGE=users.events
```

> **Importante:** nunca subas `.env` al repositorio (usa `.gitignore`). Mantén solo `.env.example` como plantilla.

---

## Cómo correr (local con entorno virtual)

Requisitos: **Python 3.11+** y **PostgreSQL**/**RabbitMQ** (locales o vía Docker).

```bash
# 1) Crear y activar venv
python -m venv .venv
# macOS/Linux
source .venv/bin/activate
# Windows (PowerShell)
# .venv\Scripts\Activate.ps1

# 2) Instalar dependencias
python -m pip install --upgrade pip
pip install -r requirements.txt

# 3) Variables de entorno
cp .env.example .env
# edita .env según tu entorno

# 4) Migraciones
alembic upgrade head

# 5) Iniciar API
uvicorn app.main:app --reload
# Swagger: http://localhost:8000/docs
```

---

## Cómo correr (Docker)

```bash
cp .env.example .env
docker-compose up --build
# API:        http://localhost:8000/docs
# RabbitMQ UI http://localhost:15672 (user: guest / pass: guest)
```

---

## Migraciones

Generar una nueva migración al cambiar modelos:

```bash
alembic revision -m "feat: change user model" --autogenerate
alembic upgrade head
```

---

## Manejo de errores

Respuestas estandarizadas:
```json
{ "code": "internal_error", "message": "Unexpected server error" }
```

Errores comunes:
- `401` → token inválido / usuario inactivo  
- `409` → email/username duplicado  
- `422` → error de validación Pydantic

---

## Observabilidad y salud

- **Swagger UI:** `/docs`  
- **OpenAPI JSON:** `/openapi.json`  
- **ReDoc:** `/redoc`  
- **Healthcheck:** `/health`
```json
{ "status": "ok", "service": "users-service", "version": "v1" }
```

---

## Roadmap

- Implementar **Transactional Outbox** para eventos confiables  
- Políticas de contraseñas y verificación de email  
- Rate limiting en `/auth/login`  
- Endpoint `/admin` para gestión avanzada  
- Tests con `pytest` + `httpx`  
- Trazabilidad con **OpenTelemetry**

---
