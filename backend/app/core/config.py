import os
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Application
    app_name: str = "AI Interview Platform"
    debug: bool = False
    version: str = "1.0.0"
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    
    # Security
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Database
    database_url: str
    database_pool_size: int = 20
    database_max_overflow: int = 0
    
    # Supabase
    supabase_url: str
    supabase_key: str
    supabase_service_key: str
    
    # OpenAI
    openai_api_key: str
    openai_model: str = "gpt-4-1106-preview"
    
    # Redis
    redis_url: str = "redis://localhost:6379"
    
    # GitHub
    github_client_id: Optional[str] = None
    github_client_secret: Optional[str] = None
    
    # CORS
    allowed_origins: list = ["http://localhost:3000", "https://localhost:3000"]
    
    # Rate Limiting
    rate_limit_requests: int = 100
    rate_limit_window: int = 3600  # 1 hour
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()