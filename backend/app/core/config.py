from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "MANGANEX — The Earth's Hidden Intelligence"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = False

    # Security: must be provided through backend environment; no insecure fallback.
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    # Database
    DATABASE_URL: str = "sqlite:///./manganex.db"

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001"
    ]

    # ML & Simulation
    USE_SYNTHETIC_DATA: bool = True
    DATA_STATUS: str = "VALIDATED_SYNTHETIC_DEMO"

    # Google Maps Platform Integration
    GOOGLE_MAPS_API_KEY: Optional[str] = ""

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "allow"

settings = Settings()
