# tests/test_users_service.py

import pytest
from app.config import settings


# ------------------------------
# Helpers
# ------------------------------

def _register_user(client, email, username, password="S3gura123", full_name="Test User"):
    body = {
        "email": email,
        "username": username,
        "password": password,
        "full_name": full_name,
    }
    return client.post("/v1/users/register", json=body)


def _create_user_and_get_token(client, email, username, password="S3gura123", full_name="Test User"):
    # Registrar usuario
    resp_reg = _register_user(client, email, username, password, full_name)
    assert resp_reg.status_code == 201

    # Login para obtener token
    resp_login = client.post(
        "/v1/auth/login",
        json={
            "username_or_email": username,
            "password": password,
        },
    )
    assert resp_login.status_code == 200
    data = resp_login.json()
    assert "access_token" in data
    return data["access_token"]


# ------------------------------
# /health
# ------------------------------

def test_health_returns_ok(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"


def test_health_includes_service_and_version(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    # Se valida contra settings para no “quemar” el nombre
    assert data["service"] == settings.APP_NAME
    assert data["version"] == settings.APP_VERSION


# ------------------------------
# POST /v1/users/register
# ------------------------------

def test_register_creates_user_201(client):
    email = "register_ok@example.com"
    username = "register_ok"

    resp = _register_user(client, email, username)
    assert resp.status_code == 201

    data = resp.json()
    assert data["email"] == email
    assert data["username"] == username
    assert data["is_active"] is True
    assert "id" in data


def test_register_rejects_duplicate_email_409(client):
    email = "register_dup@example.com"
    username1 = "user_dup_1"
    username2 = "user_dup_2"

    # Primer registro OK
    resp1 = _register_user(client, email, username1)
    assert resp1.status_code == 201

    # Segundo registro con mismo email debe fallar
    resp2 = _register_user(client, email, username2)
    assert resp2.status_code == 409


# ------------------------------
# POST /v1/auth/login
# ------------------------------

def test_login_returns_jwt_on_valid_credentials(client):
    email = "login_ok@example.com"
    username = "login_ok"
    password = "S3gura123"

    _register_user(client, email, username, password)

    resp = client.post(
        "/v1/auth/login",
        json={
            "username_or_email": username,
            "password": password,
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data.get("token_type") == "bearer"


def test_login_fails_with_wrong_password(client):
    email = "login_fail@example.com"
    username = "login_fail"
    password = "S3gura123"

    _register_user(client, email, username, password)

    resp = client.post(
        "/v1/auth/login",
        json={
            "username_or_email": username,
            "password": "wrong-password",
        },
    )
    assert resp.status_code == 401


# ------------------------------
# GET /v1/users/me
# ------------------------------

def test_me_returns_current_user_when_authenticated(client):
    email = "me_ok@example.com"
    username = "me_ok"
    password = "S3gura123"
    full_name = "Current User"

    token = _create_user_and_get_token(client, email, username, password, full_name)

    resp = client.get(
        "/v1/users/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == email
    assert data["username"] == username
    assert data["full_name"] == full_name


def test_me_requires_authentication(client):
    resp = client.get("/v1/users/me")
    # HTTPBearer suele devolver 403 cuando falta el header, pero la ruta documenta 401.
    assert resp.status_code in (401, 403)


# ------------------------------
# PATCH /v1/users/me
# ------------------------------

def test_update_me_changes_full_name(client):
    email = "update_ok@example.com"
    username = "update_ok"
    password = "S3gura123"
    full_name = "Nombre Original"

    token = _create_user_and_get_token(client, email, username, password, full_name)

    new_name = "Nombre Actualizado"

    resp = client.patch(
        "/v1/users/me",
        json={"full_name": new_name},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["full_name"] == new_name


def test_update_me_without_token_is_rejected(client):
    resp = client.patch("/v1/users/me", json={"full_name": "No importa"})
    assert resp.status_code in (401, 403)
