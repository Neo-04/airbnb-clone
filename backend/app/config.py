from pydantic_settings import BaseSettings, SettingsConfigDict


# App settings loaded from environment variables, with local defaults.
class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "Airbnb Clone API"
    app_env: str = "development"
    debug: bool = True
    api_prefix: str = "/api"
    database_url: str = "sqlite:///./airbnb.db"
    frontend_url: str = "http://localhost:3000,http://127.0.0.1:3000"

    # JWT authentication
    jwt_secret_key: str = "change-me-in-production-use-a-long-random-string"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 10080  # 7 days

    # Allowed CORS origins, comma-separated so extra URLs (e.g. Vercel) can be added later.
    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.frontend_url.split(",") if o.strip()]


settings = Settings()
