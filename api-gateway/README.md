# API Gateway - Sistema de Mensajería para Estudiantes

Este es el API Gateway que integra todos los microservicios del sistema de mensajería para estudiantes de Ingeniería Civil Informática.

## Servicios Integrados

- **Users Service**: Autenticación y gestión de usuarios
- **Channels Service**: Gestión de canales, miembros y threads
- **Messages Service**: Sistema de mensajería
- **Files Service**: Gestión de archivos (upload/download con MinIO)
- **Moderation Service**: Moderación de contenido
- **Presence Service**: Estado de presencia de usuarios
- **Search Service**: Búsqueda de contenido

## Desarrollo Local

```bash
# Instalar dependencias
pip install -r requirements.txt

# Ejecutar en desarrollo
uvicorn app.main:app --reload --port 8000

# Ver documentación
http://localhost:8000/docs
```

## Deployment a Kubernetes

```bash
# Build de la imagen
docker build -t ghcr.io/carlosvera81/api-gateway:latest .

# Push a registry
docker push ghcr.io/carlosvera81/api-gateway:latest

# Deploy a K8s
kubectl apply -f k8s/
```

## Estructura del Proyecto

```
api-gateway/
├── app/
│   ├── main.py              # Aplicación principal
│   ├── config.py            # Configuración
│   ├── auth.py              # Autenticación JWT
│   ├── clients/
│   │   └── base.py          # Cliente HTTP para microservicios
│   └── routes/
│       ├── users.py         # Rutas de usuarios
│       ├── channels.py      # Rutas de canales
│       ├── messages.py      # Rutas de mensajes
│       ├── files.py         # Rutas de archivos
│       ├── moderation.py    # Rutas de moderación
│       ├── presence.py      # Rutas de presencia
│       └── search.py        # Rutas de búsqueda
├── k8s/                     # Manifiestos de Kubernetes
├── Dockerfile
└── requirements.txt
```

## Endpoints Principales

### Autenticación
- `POST /users/register` - Registro de usuario
- `POST /users/login` - Login (obtener JWT)
- `GET /users/me` - Perfil del usuario actual
- `PATCH /users/me` - Actualizar perfil

### Canales
- `POST /channels/` - Crear canal
- `GET /channels/{channel_id}` - Obtener canal
- `PUT /channels/{channel_id}` - Actualizar canal
- `DELETE /channels/{channel_id}` - Eliminar canal
- `POST /channels/members` - Agregar miembro
- `GET /channels/{channel_id}/members` - Listar miembros
- `POST /channels/threads` - Crear thread
- `GET /channels/{channel_id}/threads` - Listar threads

### Mensajes
- `POST /messages/threads/{thread_id}` - Enviar mensaje en thread
- `GET /messages/threads/{thread_id}` - Obtener mensajes de thread
- `PUT /messages/threads/{thread_id}/messages/{msg_id}` - Actualizar mensaje
- `DELETE /messages/threads/{thread_id}/messages/{msg_id}` - Eliminar mensaje

### Archivos
- `POST /files/` - Subir archivo
- `GET /files/` - Listar archivos
- `GET /files/{file_id}` - Obtener info de archivo
- `POST /files/{file_id}/download` - Obtener URL de descarga
- `DELETE /files/{file_id}` - Eliminar archivo

### Moderación
- `POST /moderation/check` - Verificar toxicidad de contenido
- `GET /moderation/user/{id}/strikes` - Ver strikes de usuario
- `GET /moderation/blacklist` - Ver palabras prohibidas
- `GET /moderation/bans` - Ver usuarios baneados

### Presencia
- `POST /presence/` - Actualizar estado (online/offline/away)
- `GET /presence/{userId}` - Ver estado de usuario
- `GET /presence/stats` - Estadísticas generales

### Búsqueda
- `GET /search/messages` - Buscar mensajes
- `GET /search/files` - Buscar archivos
- `GET /search/channels` - Buscar canales
- `GET /search/threads/id/{thread_id}` - Buscar thread por ID
- `GET /search/threads/category/{category}` - Buscar por categoría
- `GET /search/threads/author/{author}` - Buscar por autor
- `GET /search/threads/tag/{tag}` - Buscar por tag
- `GET /search/threads/keyword/{keyword}` - Buscar por palabra clave

## Configuración

Las URLs de los microservicios se configuran mediante variables de entorno:

```env
USERS_SERVICE_URL=http://users-service.default.svc.cluster.local:80
CHANNELS_SERVICE_URL=http://channel-api-service.default.svc.cluster.local:8000
MESSAGES_SERVICE_URL=http://messages-service.default.svc.cluster.local:80
FILES_SERVICE_URL=http://file-service-api.file-service.svc.cluster.local:80
MODERATION_SERVICE_URL=http://moderation-service.default.svc.cluster.local:8000
PRESENCE_SERVICE_URL=http://presence-service.default.svc.cluster.local:80
SEARCH_SERVICE_URL=http://search-service.default.svc.cluster.local:8000
JWT_SECRET=your-secret-key
```
