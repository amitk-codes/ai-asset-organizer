import logging
import time
from functools import lru_cache

from google import genai
from google.genai import errors

from app.config import settings

# the SDK logs an "automatic function calling" note on every call; we pass no tools
logging.getLogger("google_genai").setLevel(logging.ERROR)

# Gemini occasionally returns these on high demand / rate limits — worth retrying
_RETRYABLE = {429, 500, 503}


@lru_cache
def get_gemini() -> genai.Client:
    return genai.Client(api_key=settings.gemini_api_key)


def with_retry(fn, attempts: int = 4):
    """Call a Gemini request, retrying transient 503/429/500 errors with backoff."""
    last: Exception | None = None
    for i in range(attempts):
        try:
            return fn()
        except errors.APIError as exc:
            last = exc
            if getattr(exc, "code", None) in _RETRYABLE and i < attempts - 1:
                time.sleep(1.5 * (i + 1))  # 1.5s, 3s, 4.5s
                continue
            raise
    raise last  # pragma: no cover
