from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "users-service"
    APP_VERSION: str = "v1"
    ENV: str = "dev"

    DATABASE_URL: str
    JWT_SECRET: str
    JWT_ALG: str = "HS256"
    JWT_EXPIRES_MIN: int = 60

    RABBITMQ_URL: str
    RABBITMQ_EXCHANGE: str = "users.events"

    class Config:
        env_file = ".env"

settings = Settings()