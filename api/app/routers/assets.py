import re
import uuid

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services.embeddings import embed_text
from app.services.extraction import extract_content
from app.storage import sign_paths
from app.supabase_client import get_supabase

router = APIRouter(prefix="/assets", tags=["assets"])

BUCKET = "assets"


def _safe_name(name: str | None) -> str:
    # storage keys reject spaces and many symbols; the original name is kept in the db
    return re.sub(r"[^A-Za-z0-9._-]", "_", name or "file")


@router.post("")
async def upload_asset(file: UploadFile = File(...)):
    data = await file.read()
    asset_id = str(uuid.uuid4())
    # namespace by id (no collisions) and sanitise the name for the storage key
    storage_path = f"{asset_id}/{_safe_name(file.filename)}"

    supabase = get_supabase()
    try:
        supabase.storage.from_(BUCKET).upload(
            storage_path,
            data,
            file_options={"content-type": file.content_type or "application/octet-stream"},
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"upload failed: {exc}") from exc

    try:
        content_text = extract_content(data, file.content_type)
    except Exception:
        content_text = ""  # best-effort; a failed extraction shouldn't fail the upload

    embedding = None
    if content_text:
        try:
            embedding = embed_text(content_text)
        except Exception:
            embedding = None

    row = {
        "id": asset_id,
        "filename": file.filename,
        "storage_path": storage_path,
        "mime_type": file.content_type,
        "size_bytes": len(data),
        "content_text": content_text or None,
        "embedding": embedding,
        "status": "processed" if content_text else "uploaded",
    }
    inserted = supabase.table("assets").insert(row).execute()
    return inserted.data[0]


@router.get("")
def list_assets():
    supabase = get_supabase()
    result = (
        supabase.table("assets").select("*").order("created_at", desc=True).execute()
    )
    assets = result.data
    urls = sign_paths([a["storage_path"] for a in assets])
    for asset in assets:
        asset["url"] = urls.get(asset["storage_path"])
    return assets
