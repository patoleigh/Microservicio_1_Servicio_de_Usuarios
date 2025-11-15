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
- [Cómo desplegar en Kubernetes](#cómo-desplegar-en-kubernetes)
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

## Cómo desplegar en Kubernetes

### Requisitos previos

- Cluster de Kubernetes configurado (DigitalOcean Kubernetes)
- `kubectl` instalado y configurado con acceso al cluster
- Ingress Controller (nginx) instalado en el cluster
- cert-manager configurado para SSL/TLS automático
- RabbitMQ existente en el cluster como servicio `message-broker`

### Estructura de manifiestos K8s

```
k8s/
├── postgres-configmap.yaml       # Variables de entorno de PostgreSQL
├── postgres-secret.yaml          # Contraseña de PostgreSQL
├── postgres-pvc.yaml             # Almacenamiento persistente (5Gi)
├── postgres-statefulset.yaml     # StatefulSet de PostgreSQL
├── postgres-service.yaml         # Service interno de PostgreSQL
├── users-service-configmap.yaml  # Variables de entorno del microservicio
├── users-service-secret.yaml     # JWT Secret
├── users-service-deployment.yaml # Deployment con autoscaling
├── users-service-service.yaml    # Service interno
├── users-service-ingress.yaml    # Ingress para URL pública
└── users-service-hpa.yaml        # HorizontalPodAutoscaler
```

### Despliegue manual

```bash
# 1) Configurar kubectl con tu kubeconfig
export KUBECONFIG=./kubeconfig.yaml
# O en Windows PowerShell:
# $env:KUBECONFIG=".\kubeconfig.yaml"

# 2) Verificar conexión al cluster
kubectl cluster-info
kubectl get nodes

# 3) Desplegar PostgreSQL
kubectl apply -f k8s/postgres-configmap.yaml
kubectl apply -f k8s/postgres-secret.yaml
kubectl apply -f k8s/postgres-pvc.yaml
kubectl apply -f k8s/postgres-statefulset.yaml
kubectl apply -f k8s/postgres-service.yaml

# 4) Esperar a que PostgreSQL esté listo
kubectl wait --for=condition=ready pod -l app=postgres --timeout=300s

# 5) Crear secret para pull de imágenes desde GitHub Container Registry
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=TU_GITHUB_USERNAME \
  --docker-password=TU_GITHUB_TOKEN \
  --docker-email=TU_EMAIL

# 6) Desplegar Users Service
kubectl apply -f k8s/users-service-configmap.yaml
kubectl apply -f k8s/users-service-secret.yaml
kubectl apply -f k8s/users-service-deployment.yaml
kubectl apply -f k8s/users-service-service.yaml
kubectl apply -f k8s/users-service-ingress.yaml
kubectl apply -f k8s/users-service-hpa.yaml

# 7) Verificar el despliegue
kubectl get pods -l app=users-service
kubectl get svc users-service
kubectl get ingress users-service-ingress
kubectl get hpa users-service-hpa

# 8) Ver logs del servicio
kubectl logs -f deployment/users-service
```

### Configuración importante

#### **URL Pública**
- El servicio estará disponible en: `https://users.inf326.nursoft.dev`
- Swagger docs: `https://users.inf326.nursoft.dev/docs`

#### **Autoscaling**
El HPA (HorizontalPodAutoscaler) está configurado para:
- **Min replicas:** 1
- **Max replicas:** 2
- **Métricas:**
  - CPU > 70% → escalar
  - Memoria > 80% → escalar

#### **Persistencia**
- PostgreSQL usa un PersistentVolumeClaim de 5Gi
- Los datos persisten incluso si el pod se reinicia
- Storage class: `do-block-storage` (DigitalOcean)

#### **Conexión a RabbitMQ existente**
El microservicio se conecta al RabbitMQ del cluster:
```
amqp://guest:guest@message-broker.default.svc.cluster.local:5672/
```

### Actualizar configuración

Para cambiar variables de entorno o secrets:

```bash
# 1) Edita los archivos en k8s/
# 2) Aplica los cambios
kubectl apply -f k8s/users-service-configmap.yaml
kubectl apply -f k8s/users-service-secret.yaml

# 3) Reinicia el deployment para que tome los nuevos valores
kubectl rollout restart deployment/users-service
```

### Comandos útiles

```bash
# Ver estado del autoscaling
kubectl get hpa users-service-hpa --watch

# Escalar manualmente (temporal)
kubectl scale deployment/users-service --replicas=2

# Ver métricas de pods
kubectl top pods -l app=users-service

# Ejecutar comandos dentro de un pod
kubectl exec -it deployment/users-service -- /bin/sh

# Ver eventos del deployment
kubectl describe deployment users-service

# Eliminar todo el despliegue
kubectl delete -f k8s/
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

- ✅ **Despliegue en Kubernetes con autoscaling**
- ✅ **URL pública con HTTPS**
- Implementar **Transactional Outbox** para eventos confiables  
- Políticas de contraseñas y verificación de email  
- Rate limiting en `/auth/login`  
- Endpoint `/admin` para gestión avanzada  
- Tests con `pytest` + `httpx`  
- Trazabilidad con **OpenTelemetry**
- Monitoreo con Prometheus y Grafana
- CI/CD pipeline (opcional)

---
