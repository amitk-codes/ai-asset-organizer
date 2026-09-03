from fastapi import APIRouter
from pydantic import BaseModel

from app.services.organizer import suggest_folders
from app.supabase_client import get_supabase

router = APIRouter(prefix="/organize", tags=["organize"])


class FolderPlan(BaseModel):
    name: str
    asset_ids: list[str]


class ApplyRequest(BaseModel):
    folders: list[FolderPlan]


@router.post("/suggest")
def suggest():
    supabase = get_supabase()
    # only assets that haven't been placed in a folder yet
    result = (
        supabase.table("assets")
        .select("id, filename, content_text")
        .is_("folder_id", "null")
        .execute()
    )
    return {"folders": suggest_folders(result.data)}


@router.post("/apply")
def apply(request: ApplyRequest):
    supabase = get_supabase()
    created = []
    for folder in request.folders:
        if not folder.asset_ids:
            continue
        inserted = supabase.table("folders").insert({"name": folder.name}).execute()
        folder_id = inserted.data[0]["id"]
        supabase.table("assets").update(
            {"folder_id": folder_id, "status": "organized"}
        ).in_("id", folder.asset_ids).execute()
        created.append(
            {"id": folder_id, "name": folder.name, "count": len(folder.asset_ids)}
        )
    return {"folders": created}
