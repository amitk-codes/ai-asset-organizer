from google.genai import types

from app.gemini_client import get_gemini

EMBED_MODEL = "gemini-embedding-001"
EMBED_DIM = 768  # match the pgvector column; cosine similarity is scale-invariant
_MAX_CHARS = 8000  # embedding models cap their input; truncate long documents


def embed_text(text: str) -> list[float] | None:
    text = (text or "").strip()[:_MAX_CHARS]
    if not text:
        return None
    client = get_gemini()
    response = client.models.embed_content(
        model=EMBED_MODEL,
        contents=text,
        config=types.EmbedContentConfig(output_dimensionality=EMBED_DIM),
    )
    return response.embeddings[0].values
