from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file = BASE_DIR / ".env",
        extra = "ignore"
        )
    
    ENV: str  = "test"
    
    PROJECT_NAME: str = "Surveys API"
    API_V1_PREFIX: str
    FRONTEND_URL: str
    SECRET_KEY: str 
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    CONFIRMATION_TOKEN_EXPIRE_MINUTES: int = 10
    PASSWORD_RESET_TOKEN_EXPIRE_MINUTES: int = 10

    AWS_ACCESS_KEY_ID: str
    AWS_SECRET_ACCESS_KEY: str
    REGION_NAME: str
    DOMAIN_MAIL: str

    POSTGRES_USER : str 
    POSTGRES_PASSWORD : str
    POSTGRES_SERVER : str 
    POSTGRES_PORT : str 
    POSTGRES_DB : str

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )
    
settings = Settings()
