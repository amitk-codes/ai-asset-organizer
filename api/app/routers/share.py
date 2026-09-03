from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.supabase_client import get_supabase

router = APIRouter(prefix="/share", tags=["share"])

BUCKET = "assets"
SIGNED_URL_TTL = 3600  # seconds


class ShareRequest(BaseModel):
    target_type: str  # 'folder' or 'asset'
    target_id: str


@router.post("")
def create_share(request: ShareRequest):
    if request.target_type not in ("folder", "asset"):
        raise HTTPException(status_code=400, detail="target_type must be 'folder' or 'asset'")
    supabase = get_supabase()
    inserted = (
        supabase.table("shares")
        .insert({"target_type": request.target_type, "target_id": request.target_id})
        .execute()
    )
    return inserted.data[0]


@router.get("/{token}")
def resolve_share(token: str):
    supabase = get_supabase()
    try:
        share = supabase.table("shares").select("*").eq("id", token).execute()
    except Exception:
        raise HTTPException(status_code=404, detail="share not found")
    if not share.data:
        raise HTTPException(status_code=404, detail="share not found")

    share_row = share.data[0]
    target_id = share_row["target_id"]

    if share_row["target_type"] == "asset":
        asset = supabase.table("assets").select("*").eq("id", target_id).execute()
        if not asset.data:
            raise HTTPException(status_code=404, detail="asset not found")
        return {"type": "asset", "asset": _with_url(supabase, asset.data[0])}

    folder = supabase.table("folders").select("*").eq("id", target_id).execute()
    if not folder.data:
        raise HTTPException(status_code=404, detail="folder not found")
    assets = supabase.table("assets").select("*").eq("folder_id", target_id).execute()
    return {
        "type": "folder",
        "folder": folder.data[0],
        "assets": [_with_url(supabase, a) for a in assets.data],
    }


def _with_url(supabase, asset: dict) -> dict:
    # private bucket → hand out a short-lived signed URL, not a public link
    try:
        signed = supabase.storage.from_(BUCKET).create_signed_url(
            asset["storage_path"], SIGNED_URL_TTL
        )
        asset["url"] = signed.get("signedURL") or signed.get("signedUrl")
    except Exception:
        asset["url"] = None
    return asset
