# Environment variables loader
from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_ENV_PATH = Path(__file__).resolve().parents[2] / ".env"


class Settings(BaseSettings):
    database_url: str = ""
    secret_key: str = ""
    cf_account_id: str = ""
    cf_kv_namespace_id: str = ""
    cf_api_token: str = ""
    backend_cors_origins: str = ""

    # Naver API
    naver_client_id: str = ""
    naver_client_secret: str = ""

    # Supabase
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""

    model_config = SettingsConfigDict(
        env_file=str(BACKEND_ENV_PATH),
        extra="ignore",
    )

    @field_validator(
        "database_url",
        "supabase_url",
        "supabase_anon_key",
        "supabase_service_role_key",
        "backend_cors_origins",
        mode="before",
    )
    @classmethod
    def clean_string_value(cls, value: str) -> str:
        if isinstance(value, str):
            return value.strip()
        return value

    @property
    def cors_origins(self) -> list[str]:
        defaults = [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ]
        extra_origins = [
            origin.strip()
            for origin in self.backend_cors_origins.split(",")
            if origin.strip()
        ]
        return defaults + [origin for origin in extra_origins if origin not in defaults]


settings = Settings()
