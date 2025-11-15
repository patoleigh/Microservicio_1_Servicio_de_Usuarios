from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # App settings
    APP_NAME: str = "api-gateway"
    APP_VERSION: str = "v1"
    ENV: str = "production"
    
    # JWT Settings (heredados del users-service)
    JWT_SECRET: str = "your-secret-key-change-in-production"
    JWT_ALG: str = "HS256"
    
    # Microservices URLs (interno cluster K8s)
    USERS_SERVICE_URL: str = "http://users-service.default.svc.cluster.local:80"
    CHANNEL_SERVICE_URL: str = "http://channel-api-service.default.svc.cluster.local:8000"
    MESSAGES_SERVICE_URL: str = "http://messages-service.default.svc.cluster.local:80"
    FILES_SERVICE_URL: str = "http://file-service-api.file-service.svc.cluster.local:80"
    MODERATION_SERVICE_URL: str = "http://moderation-service.default.svc.cluster.local:8000"
    PRESENCE_SERVICE_URL: str = "http://presence-service.default.svc.cluster.local:80"
    SEARCH_SERVICE_URL: str = "http://search-service.default.svc.cluster.local:8000"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
