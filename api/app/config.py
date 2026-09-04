from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    groq_api_key: str = ""
    groq_model: str = "openai/gpt-oss-120b"
    gemini_api_key: str = ""
    # Model ids are configurable because Gemini rotates and deprecates them; pin a
    # concrete, currently-served model rather than a "-latest" alias that can point
    # at an overloaded endpoint.
    gemini_vision_model: str = "gemini-3.1-flash-lite"
    gemini_organize_model: str = "gemini-3.1-flash-lite"
    gemini_embed_model: str = "gemini-embedding-001"
    gemini_timeout_ms: int = 30000  # hard per-request cap so a stalled call can't hang the upload
    supabase_url: str = ""
    supabase_service_key: str = ""
    allowed_origins: str = "http://localhost:3000"

    @property
    def origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


settings = Settings()
