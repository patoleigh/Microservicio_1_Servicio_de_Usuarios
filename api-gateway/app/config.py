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
    
    # Microservices URLs - External services (otros grupos)
    # Grupo 1 (propio)
    USERS_SERVICE_URL: str = "https://users.inf326.nursoft.dev"
    
    # Otros grupos
    CHANNEL_SERVICE_URL: str = "https://channel-api.inf326.nur.dev"
    MESSAGES_SERVICE_URL: str = "https://messages-service.kroder.dev"
    FILES_SERVICE_URL: str = "http://file-service-134-199-176-197.nip.io"
    MODERATION_SERVICE_URL: str = "https://moderation.inf326.nur.dev"
    PRESENCE_SERVICE_URL: str = "https://presence-134-199-176-197.nip.io"
    SEARCH_SERVICE_URL: str = "https://searchservice.inf326.nursoft.dev"
    WIKIPEDIA_SERVICE_URL: str = "http://wikipedia-chatbot-134-199-176-197.nip.io"
    CHATBOT_PROG_SERVICE_URL: str = "https://chatbotprogra.inf326.nursoft.dev"
    THREADS_SERVICE_URL: str = "http://threads-service.default.svc.cluster.local"
    FILES_SERVICE_URL: str = "http://file-service-api.file-service.svc.cluster.local:80"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
