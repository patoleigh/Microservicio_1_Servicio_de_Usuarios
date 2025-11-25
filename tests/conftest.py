# tests/conftest.py

import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import sessionmaker

# 👉 Para tests: usar una DB SQLite local descartable
os.environ["DATABASE_URL"] = "sqlite:///./test_users.db"

from app.main import app
from app.db import Base, engine, get_db
from app import events as events_module
from app.routes import users as users_routes

# --- Inicializar schema en la DB de tests (SQLite) ---
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# DB limpia para las pruebas
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


# Sobrescribir la dependencia de BD para que FastAPI use SQLite en tests
app.dependency_overrides[get_db] = override_get_db


# --- Stub de RabbitMQ: no queremos depender del broker en tests ---
async def fake_publish_user_event(event_type: str, payload: dict, user_id: str):
    return None


events_module.publish_user_event = fake_publish_user_event
users_routes.publish_user_event = fake_publish_user_event


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c
