# Microservicio de Usuarios

Microservicio REST para gestionar usuarios dentro de una arquitectura de microservicios.  
Expone endpoints para:

- **Healthcheck** del servicio.
- **Registro** de usuarios.
- **Autenticación** mediante JWT.
- **Consulta y actualización** del perfil del usuario autenticado.
- **Publicación de eventos** de usuario (alta, actualización, etc.) hacia RabbitMQ.

Tecnologías principales:

- [FastAPI](https://fastapi.tiangolo.com/)
- [SQLAlchemy](https://www.sqlalchemy.org/) + Pydantic
- [PostgreSQL](https://www.postgresql.org/) (entorno Docker)
- [RabbitMQ](https://www.rabbitmq.com/) (eventos de usuarios)
- [pytest](https://docs.pytest.org/) + `fastapi.testclient.TestClient` (pruebas de servicio)


## 1. Endpoints principales

Todos los endpoints están versionados bajo `/v1`:

- `GET /health`  
  - Verifica que el servicio está corriendo.
  - Respuesta esperada:  
    ```json
    {
      "status": "ok",
      "service": "<APP_NAME>",
      "version": "<APP_VERSION>"
    }
    ```

- `POST /v1/users/register`  
  - Registra un nuevo usuario.  
  - Body (JSON):  
    ```json
    {
      "email": "user@example.com",
      "username": "myuser",
      "password": "S3gura123",
      "full_name": "Nombre Apellido"
    }
    ```
  - Respuestas típicas:
    - `201 Created` → Usuario creado.
    - `409 Conflict` → Email o username ya registrados.

- `POST /v1/auth/login`  
  - Autentica un usuario por `username` o `email` + `password`.  
  - Body (JSON):
    ```json
    {
      "username_or_email": "myuser",
      "password": "S3gura123"
    }
    ```
  - Respuestas típicas:
    - `200 OK` → `{"access_token": "<jwt>", "token_type": "bearer"}`
    - `401 Unauthorized` → Credenciales inválidas.

- `GET /v1/users/me`  
  - Devuelve los datos del usuario autenticado.
  - Requiere header: `Authorization: Bearer <token>`.
  - Respuestas típicas:
    - `200 OK` → Datos del usuario (`id`, `email`, `username`, `full_name`, `is_active`, etc.).
    - `401/403` → Sin token o token inválido.

- `PATCH /v1/users/me`  
  - Permite actualizar campos del perfil del usuario autenticado (por ejemplo `full_name`).
  - Requiere header: `Authorization: Bearer <token>`.
  - Respuestas típicas:
    - `200 OK` → Usuario actualizado.
    - `401/403` → Sin token o token inválido.


## 2. Configuración de entorno

El servicio se configura a través de variables de entorno (archivo `.env`):

```env
APP_NAME=users-service
APP_VERSION=v1
ENV=dev

DATABASE_URL=postgresql+psycopg2://postgres:postgres@db:5433/usersdb

JWT_SECRET=supersecret-change-me
JWT_ALG=HS256
JWT_EXPIRES_MIN=60

RABBITMQ_URL=amqp://guest:guest@mq:5672/
RABBITMQ_EXCHANGE=users.events
```

> **Nota:** En el entorno Docker, el host `db` corresponde al contenedor de PostgreSQL definido en `docker-compose.yml`.


## 3. Ejecutar con Docker Compose

Requisitos:

- Docker
- Docker Compose

Pasos típicos:

```bash
# 1. Crear el archivo .env (si no existe todavía)
cp .env.example .env   # si el repo incluye .env.example
# o editar .env manualmente con los valores anteriores

# 2. Levantar servicios (API, DB, MQ)
docker compose up --build
```

Por defecto:

- La API queda publicada en: **http://localhost:8000**
- Documentación interactiva (Swagger): **http://localhost:8000/docs**
- RabbitMQ Management UI: **http://localhost:15672**
  - Usuario/clave por defecto: `guest` / `guest`

Para apagar los servicios:

```bash
docker compose down
```


## 4. Ejecutar la API sin Docker (opcional)

También es posible correr la API directamente con `uvicorn` en local.

1. Crear y activar entorno virtual:

```bash
python -m venv .venv
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
# Linux / macOS
# source .venv/bin/activate
```

2. Instalar dependencias:

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

3. Asegurarse de tener Postgres y RabbitMQ disponibles, y configurar `DATABASE_URL` y `RABBITMQ_URL` en `.env`.

4. Ejecutar la app:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

La API estará disponible en `http://localhost:8000`.


## 5. Pruebas de servicio (FastAPI + pytest)

Las pruebas de servicio se implementan con:

- [`fastapi.testclient.TestClient`](https://fastapi.tiangolo.com/advanced/testing/)
- [`pytest`](https://docs.pytest.org/)

### 5.1. Instalación de dependencias de tests

Con el entorno virtual activado:

```bash
pip install -r requirements.txt
# Asegurarse de que estén pytest y httpx
pip install pytest httpx
```

### 5.2. BD para pruebas (SQLite)

Para **evitar depender de Postgres y no persistir datos en las pruebas**, el archivo `tests/conftest.py`:

- Sobrescribe `DATABASE_URL` para usar una BD SQLite local (`sqlite:///./test_users.db`).
- Inicializa el esquema de la BD de pruebas antes de ejecutar los tests:
  - `Base.metadata.drop_all(bind=engine)`
  - `Base.metadata.create_all(bind=engine)`
- Sobrescribe la dependencia `get_db` para que FastAPI use esa sesión de SQLite.
- Stub-ea `publish_user_event` para no requerir RabbitMQ real en pruebas (los eventos se “simulan” y no se envían al broker).

Esto permite correr `pytest` sin afectar la base de datos real del entorno Docker ni depender de servicios externos, y al mismo tiempo asegura que los datos de pruebas no persistan entre ejecuciones.

### 5.3. Ejecutar los tests

Desde la raíz del proyecto:

```bash
# Todos los tests
python -m pytest -q

# Sólo las pruebas del servicio de usuarios
python -m pytest tests/test_users_service.py -q
```

Para ver más detalle por cada prueba:

```bash
python -m pytest tests/test_users_service.py -vv
```

Si se desea ver los `print()` o logs en consola:

```bash
python -m pytest tests/test_users_service.py -vv -s
```


## 6. Cobertura de pruebas por endpoint

Actualmente se incluyen **al menos 2 pruebas por endpoint** del Users Service:

- `GET /health`
  - `test_health_returns_ok`: respuesta con `status="ok"`.
  - `test_health_includes_service_and_version`: incluye `service` y `version` según configuración.

- `POST /v1/users/register`
  - `test_register_creates_user_201`: registro exitoso (`201`) con datos correctos.
  - `test_register_rejects_duplicate_email_409`: intento de registro con email duplicado (`409`).

- `POST /v1/auth/login`
  - `test_login_returns_jwt_on_valid_credentials`: login exitoso devuelve JWT (`200`).
  - `test_login_fails_with_wrong_password`: login con contraseña incorrecta devuelve `401`.

- `GET /v1/users/me`
  - `test_me_returns_current_user_when_authenticated`: con token válido devuelve el usuario autenticado (`200`).
  - `test_me_requires_authentication`: sin token devuelve `401/403`.

- `PATCH /v1/users/me`
  - `test_update_me_changes_full_name`: con token válido permite actualizar el `full_name` (`200`).
  - `test_update_me_without_token_is_rejected`: sin token devuelve `401/403`.

Todas estas pruebas se ejecutan contra la API montada en memoria con `TestClient`, usando la BD SQLite descartable.


## 7. Notas para desarrollo / evaluación

- Para desarrollo local con Docker se recomienda usar Postgres (como está configurado en `.env` y `docker-compose.yml`).
- Para las **pruebas automatizadas con pytest** se usa una BD SQLite local para:
  - Reducir dependencias externas (no requiere que Postgres esté arriba).
  - Asegurar que los datos de pruebas no persisten entre ejecuciones.
  - Acelerar la ejecución de las pruebas.
- El reseteo de la BD se maneja exclusivamente dentro de los tests (SQLite), por lo que el entorno “real” en Docker no borra ni recrea tablas automáticamente.
