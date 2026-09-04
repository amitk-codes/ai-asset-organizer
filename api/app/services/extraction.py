import io

from google.genai import types
from pypdf import PdfReader

from app.config import settings
from app.gemini_client import get_gemini

_IMAGE_PROMPT = (
    "Describe this image so it can be found later by search. Include: what it shows; the kind of "
    "document or content it is (e.g. invoice, receipt, screenshot, photo, chart, ID card, form, "
    "diagram); any visible text verbatim (names, dates, amounts, titles); and 3-6 relevant keywords. "
    "Be concise but specific."
)


def extract_content(data: bytes, mime_type: str | None) -> str:
    """Turn a raw file into searchable text: a caption for images, the text for documents."""
    mime = mime_type or ""
    if mime.startswith("image/"):
        return _describe_image(data, mime)
    if mime == "application/pdf":
        return _read_pdf(data)
    if mime.startswith("text/"):
        return data.decode("utf-8", errors="ignore").strip()
    return ""


def _describe_image(data: bytes, mime_type: str) -> str:
    client = get_gemini()
    response = client.models.generate_content(
        model=settings.gemini_vision_model,
        contents=[
            types.Part.from_bytes(data=data, mime_type=mime_type),
            _IMAGE_PROMPT,
        ],
    )
    return (response.text or "").strip()


def _read_pdf(data: bytes) -> str:
    reader = PdfReader(io.BytesIO(data))
    pages = [page.extract_text() or "" for page in reader.pages]
    return "\n".join(pages).strip()
