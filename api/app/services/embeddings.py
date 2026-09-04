from google.genai import types

from app.gemini_client import get_gemini, with_retry

EMBED_MODEL = "gemini-embedding-001"
EMBED_DIM = 768  # match the pgvector column; cosine similarity is scale-invariant
_MAX_CHARS = 8000  # embedding models cap their input; truncate long documents


def embed_text(text: str, task_type: str = "RETRIEVAL_DOCUMENT") -> list[float] | None:
    """Embed text. Use RETRIEVAL_DOCUMENT when storing, RETRIEVAL_QUERY when searching —
    the matching task types noticeably improve retrieval accuracy."""
    text = (text or "").strip()[:_MAX_CHARS]
    if not text:
        return None
    client = get_gemini()
    response = with_retry(
        lambda: client.models.embed_content(
            model=EMBED_MODEL,
            contents=text,
            config=types.EmbedContentConfig(task_type=task_type, output_dimensionality=EMBED_DIM),
        )
    )
    return response.embeddings[0].values
