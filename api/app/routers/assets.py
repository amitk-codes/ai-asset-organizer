import json
import re
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.auth import get_user_id
from app.services.embeddings import embed_text
from app.services.extraction import extract_content
from app.storage import sign_paths
from app.supabase_client import get_supabase

router = APIRouter(prefix="/assets", tags=["assets"])

BUCKET = "assets"


def _safe_name(name: str | None) -> str:
    # storage keys reject spaces and many symbols; the original name is kept in the db
    return re.sub(r"[^A-Za-z0-9._-]", "_", name or "file")


def _sse(obj: dict) -> str:
    return f"data: {json.dumps(obj)}\n\n"


class MoveRequest(BaseModel):
    folder_id: str | None = None  # null moves the asset out of any folder


class BatchDeleteRequest(BaseModel):
    ids: list[str]


class BatchMoveRequest(BaseModel):
    ids: list[str]
    folder_id: str | None = None


@router.post("")
async def upload_asset(file: UploadFile = File(...), user_id: str = Depends(get_user_id)):
    """Streams progress as Server-Sent-style events so the UI can show real
    processing stages: stored -> extracting -> embedding -> done (or error)."""
    data = await file.read()
    filename = file.filename
    content_type = file.content_type
    asset_id = str(uuid.uuid4())
    # namespace by id (no collisions) and sanitise the name for the storage key
    storage_path = f"{asset_id}/{_safe_name(filename)}"

    async def stream():
        supabase = get_supabase()

        # 1. store the raw bytes
        try:
            await run_in_threadpool(
                lambda: supabase.storage.from_(BUCKET).upload(
                    storage_path,
                    data,
                    file_options={"content-type": content_type or "application/octet-stream"},
                )
            )
        except Exception as exc:
            yield _sse({"stage": "error", "detail": f"upload failed: {exc}"})
            return
        yield _sse({"stage": "stored"})

        # 2. extract searchable content (vision caption / pdf text) — best-effort
        yield _sse({"stage": "extracting"})
        try:
            content_text = await run_in_threadpool(extract_content, data, content_type)
        except Exception:
            content_text = ""

        # 3. embed for semantic search — best-effort
        embedding = None
        if content_text:
            yield _sse({"stage": "embedding"})
            try:
                embedding = await run_in_threadpool(embed_text, content_text)
            except Exception:
                embedding = None

        # 4. persist the row
        row = {
            "id": asset_id,
            "user_id": user_id,
            "filename": filename,
            "storage_path": storage_path,
            "mime_type": content_type,
            "size_bytes": len(data),
            "content_text": content_text or None,
            "embedding": embedding,
            "status": "processed" if content_text else "uploaded",
        }
        try:
            inserted = await run_in_threadpool(
                lambda: supabase.table("assets").insert(row).execute()
            )
            yield _sse({"stage": "done", "asset": inserted.data[0]})
        except Exception as exc:
            yield _sse({"stage": "error", "detail": f"save failed: {exc}"})

    return StreamingResponse(stream(), media_type="text/event-stream")


@router.get("")
def list_assets(
    user_id: str = Depends(get_user_id),
    limit: int = Query(default=60, ge=1, le=200),
    cursor: str | None = Query(default=None),
):
    # keyset pagination, newest first: cursor is the created_at of the last seen row
    supabase = get_supabase()
    query = supabase.table("assets").select("*").eq("user_id", user_id)
    if cursor:
        query = query.lt("created_at", cursor)
    result = query.order("created_at", desc=True).limit(limit).execute()

    assets = result.data
    urls = sign_paths([a["storage_path"] for a in assets])
    for asset in assets:
        asset["url"] = urls.get(asset["storage_path"])

    next_cursor = assets[-1]["created_at"] if len(assets) == limit else None
    return {"items": assets, "next_cursor": next_cursor}


@router.post("/batch/delete")
def batch_delete_assets(request: BatchDeleteRequest, user_id: str = Depends(get_user_id)):
    if not request.ids:
        return {"ok": True, "deleted": 0}
    supabase = get_supabase()
    owned = (
        supabase.table("assets")
        .select("id, storage_path")
        .eq("user_id", user_id)
        .in_("id", request.ids)
        .execute()
    )
    rows = owned.data
    if not rows:
        return {"ok": True, "deleted": 0}

    paths = [r["storage_path"] for r in rows]
    try:
        supabase.storage.from_(BUCKET).remove(paths)
    except Exception:
        pass  # best-effort; still remove the rows

    ids = [r["id"] for r in rows]
    supabase.table("assets").delete().eq("user_id", user_id).in_("id", ids).execute()
    return {"ok": True, "deleted": len(ids)}


@router.post("/batch/move")
def batch_move_assets(request: BatchMoveRequest, user_id: str = Depends(get_user_id)):
    if not request.ids:
        return {"ok": True, "moved": 0}
    supabase = get_supabase()
    status = "organized" if request.folder_id else "processed"
    result = (
        supabase.table("assets")
        .update({"folder_id": request.folder_id, "status": status})
        .eq("user_id", user_id)
        .in_("id", request.ids)
        .execute()
    )
    return {"ok": True, "moved": len(result.data)}


@router.patch("/{asset_id}")
def move_asset(asset_id: str, request: MoveRequest, user_id: str = Depends(get_user_id)):
    supabase = get_supabase()
    status = "organized" if request.folder_id else "processed"
    result = (
        supabase.table("assets")
        .update({"folder_id": request.folder_id, "status": status})
        .eq("id", asset_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="asset not found")
    return result.data[0]


@router.delete("/{asset_id}")
def delete_asset(asset_id: str, user_id: str = Depends(get_user_id)):
    supabase = get_supabase()
    found = (
        supabase.table("assets")
        .select("storage_path")
        .eq("id", asset_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not found.data:
        raise HTTPException(status_code=404, detail="asset not found")

    try:
        supabase.storage.from_(BUCKET).remove([found.data[0]["storage_path"]])
    except Exception:
        pass  # best-effort; still remove the row

    supabase.table("assets").delete().eq("id", asset_id).eq("user_id", user_id).execute()
    return {"ok": True}
