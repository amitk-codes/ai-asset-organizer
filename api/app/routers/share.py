from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.auth import get_user_id
from app.supabase_client import get_supabase

router = APIRouter(prefix="/share", tags=["share"])
# listing lives at /shares (outside the /share prefix)
shares_router = APIRouter(tags=["share"])

BUCKET = "assets"
SIGNED_URL_TTL = 3600  # seconds


class ShareRequest(BaseModel):
    target_type: str  # 'folder' or 'asset'
    target_id: str
    expires_in_days: int | None = None  # null = never expires


@router.post("")
def create_share(request: ShareRequest, user_id: str = Depends(get_user_id)):
    if request.target_type not in ("folder", "asset"):
        raise HTTPException(status_code=400, detail="target_type must be 'folder' or 'asset'")
    supabase = get_supabase()
    # only the owner can share their folder or asset
    table = "folders" if request.target_type == "folder" else "assets"
    owned = (
        supabase.table(table)
        .select("id")
        .eq("id", request.target_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not owned.data:
        raise HTTPException(status_code=404, detail="not found")

    expires_at = None
    if request.expires_in_days and request.expires_in_days > 0:
        expires_at = (
            datetime.now(timezone.utc) + timedelta(days=request.expires_in_days)
        ).isoformat()

    inserted = (
        supabase.table("shares")
        .insert(
            {
                "target_type": request.target_type,
                "target_id": request.target_id,
                "user_id": user_id,
                "expires_at": expires_at,
                "revoked": False,
            }
        )
        .execute()
    )
    return inserted.data[0]


@shares_router.get("/shares")
def list_shares(user_id: str = Depends(get_user_id)):
    supabase = get_supabase()
    result = (
        supabase.table("shares")
        .select("id, target_type, target_id, created_at, expires_at, revoked")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


@router.delete("/{token}")
def revoke_share(token: str, user_id: str = Depends(get_user_id)):
    supabase = get_supabase()
    result = (
        supabase.table("shares")
        .update({"revoked": True})
        .eq("id", token)
        .eq("user_id", user_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="share not found")
    return {"ok": True}


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
    if share_row.get("revoked"):
        raise HTTPException(status_code=404, detail="share revoked")
    if _is_expired(share_row.get("expires_at")):
        raise HTTPException(status_code=404, detail="share expired")

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


def _is_expired(expires_at: str | None) -> bool:
    if not expires_at:
        return False
    try:
        return datetime.fromisoformat(expires_at) < datetime.now(timezone.utc)
    except ValueError:
        return False


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
