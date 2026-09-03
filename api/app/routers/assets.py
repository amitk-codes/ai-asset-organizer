import uuid

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.supabase_client import get_supabase

router = APIRouter(prefix="/assets", tags=["assets"])

BUCKET = "assets"


@router.post("")
async def upload_asset(file: UploadFile = File(...)):
    data = await file.read()
    asset_id = str(uuid.uuid4())
    # namespace the path by id so identical filenames never collide
    storage_path = f"{asset_id}/{file.filename}"

    supabase = get_supabase()
    try:
        supabase.storage.from_(BUCKET).upload(
            storage_path,
            data,
            file_options={"content-type": file.content_type or "application/octet-stream"},
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"upload failed: {exc}") from exc

    row = {
        "id": asset_id,
        "filename": file.filename,
        "storage_path": storage_path,
        "mime_type": file.content_type,
        "size_bytes": len(data),
        "status": "uploaded",
    }
    inserted = supabase.table("assets").insert(row).execute()
    return inserted.data[0]


@router.get("")
def list_assets():
    supabase = get_supabase()
    result = (
        supabase.table("assets").select("*").order("created_at", desc=True).execute()
    )
    return result.data
