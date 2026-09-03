from functools import lru_cache

from groq import Groq

from app.config import settings


@lru_cache
def get_groq() -> Groq:
    return Groq(api_key=settings.groq_api_key)
