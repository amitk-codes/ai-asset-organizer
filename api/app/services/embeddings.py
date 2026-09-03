from app.gemini_client import get_gemini

EMBED_MODEL = "text-embedding-004"
_MAX_CHARS = 8000  # embedding models cap their input; truncate long documents


def embed_text(text: str) -> list[float] | None:
    text = (text or "").strip()[:_MAX_CHARS]
    if not text:
        return None
    client = get_gemini()
    response = client.models.embed_content(model=EMBED_MODEL, contents=text)
    return response.embeddings[0].values
