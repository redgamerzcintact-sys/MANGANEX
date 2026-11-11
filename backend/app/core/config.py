import logging
import os
import secrets
from typing import List, Optional
from pydantic import field_validator
from pydantic_settings import BaseSettings

logger = logging.getLogger("manganex.config")

# Ephemeral fallback key generated per process if SECRET_KEY is unset in development
_EPHEMERAL_DEV_SECRET = secrets.token_urlsafe(48)


class Settings(BaseSettings):
    PROJECT_NAME: str = "MANGANEX — The Earth's Hidden Intelligence"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Environment (default to development locally; set ENVIRONMENT=production in prod)
    ENVIRONMENT: str = "development"
    DEBUG: bool = False

    # Security: Always inject SECRET_KEY via environment/.env in production
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Only allow inline demo verification/reset tokens when explicitly in non-production
    ALLOW_DEMO_AUTH_TOKENS: Optional[bool] = None
    # Allow 1-click showcase demo login (defaults true outside production; override via env)
    ALLOW_DEMO_LOGIN: Optional[bool] = None
    # Require explicit email-link verification before login (enable once SMTP delivery is configured)
    REQUIRE_EMAIL_VERIFICATION: bool = False

    # Database
    DATABASE_URL: str = "sqlite:///./manganex.db"

    # CORS (supports comma-separated string or JSON array via env)
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:5173",
    ]
    BACKEND_CORS_ORIGIN_REGEX: Optional[str] = None

    # ML & Simulation
    USE_SYNTHETIC_DATA: bool = True
    DATA_STATUS: str = "VALIDATED_SYNTHETIC_DEMO"

    # Google Maps Platform Integration
    GOOGLE_MAPS_API_KEY: Optional[str] = ""

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    @property
    def effective_secret_key(self) -> str:
        key = (self.SECRET_KEY or os.getenv("SECRET_KEY", "")).strip()
        if key and len(key) >= 32:
            return key
        if self.ENVIRONMENT.lower() == "production":
            raise RuntimeError(
                "SECRET_KEY environment variable (>= 32 chars) must be set when ENVIRONMENT=production."
            )
        if not key:
            logger.warning(
                "SECRET_KEY not configured; using ephemeral runtime key for development session."
            )
        return _EPHEMERAL_DEV_SECRET

    @property
    def allow_demo_tokens_in_response(self) -> bool:
        if self.ENVIRONMENT.lower() == "production":
            return False
        if self.ALLOW_DEMO_AUTH_TOKENS is not None:
            return self.ALLOW_DEMO_AUTH_TOKENS
        return True

    @property
    def allow_demo_login(self) -> bool:
        if self.ALLOW_DEMO_LOGIN is not None:
            return self.ALLOW_DEMO_LOGIN
        return self.ENVIRONMENT.lower() != "production"

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "allow"


settings = Settings()
