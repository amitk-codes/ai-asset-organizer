import logging
from functools import lru_cache

from google import genai

from app.config import settings

# the SDK logs an "automatic function calling" note on every call; we pass no tools
logging.getLogger("google_genai").setLevel(logging.ERROR)


@lru_cache
def get_gemini() -> genai.Client:
    return genai.Client(api_key=settings.gemini_api_key)
