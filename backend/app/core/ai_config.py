import os
from pydantic_settings import BaseSettings
from typing import Optional

class AISettings(BaseSettings):
    # Hugging Face & LLM Configuration
    HF_TOKEN: Optional[str] = os.getenv("HF_TOKEN", "")
    HF_MODEL_ID: str = os.getenv("HF_MODEL_ID", "meta-llama/Llama-3.2-3B-Instruct")
    HF_EMBEDDING_MODEL: str = os.getenv("HF_EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "huggingface")  # huggingface | local | fallback
    LLM_MODEL: str = os.getenv("LLM_MODEL", "meta-llama/Llama-3.2-3B-Instruct")
    
    # RAG Settings
    CHUNK_SIZE: int = 500
    CHUNK_OVERLAP: int = 50
    TOP_K_RETRIEVAL: int = 4
    SIMILARITY_THRESHOLD: float = 0.25

ai_settings = AISettings()

