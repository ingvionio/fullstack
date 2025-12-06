from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment variables or .env."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = Field(default="Health Map API", validation_alias="APP_NAME")
    environment: Literal["local", "prod", "test"] = Field(default="local", validation_alias="ENVIRONMENT")
    database_url: str = Field(default="sqlite+aiosqlite:///./health_map.db", validation_alias="DATABASE_URL")
    secret_key: str = Field(default="super-secret-key", validation_alias="SECRET_KEY")
    media_root: Path = Field(default=Path("media"), validation_alias="MEDIA_ROOT")

    @model_validator(mode="after")
    def ensure_async_sqlite(self) -> "Settings":
        """Force async SQLite driver usage when a sync URL is provided."""

        if self.database_url.startswith("sqlite://") and "+aiosqlite" not in self.database_url:
            self.database_url = self.database_url.replace("sqlite://", "sqlite+aiosqlite://", 1)
        return self


@lru_cache
def get_settings() -> Settings:
    """Return cached settings to avoid reloading env variables."""

    return Settings()


settings = get_settings()
