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
    unorganized = (
        supabase.table("assets")
        .select("id, filename, content_text")
        .is_("folder_id", "null")
        .execute()
    )
    existing = supabase.table("folders").select("name").execute()
    names = [f["name"] for f in existing.data]
    return {"folders": suggest_folders(unorganized.data, names)}


@router.post("/apply")
def apply(request: ApplyRequest):
    supabase = get_supabase()
    existing = supabase.table("folders").select("id, name").execute()
    by_name = {f["name"]: f["id"] for f in existing.data}

    created = []
    for folder in request.folders:
        if not folder.asset_ids:
            continue
        # reuse a folder of the same name instead of creating a duplicate
        folder_id = by_name.get(folder.name)
        if folder_id is None:
            inserted = supabase.table("folders").insert({"name": folder.name}).execute()
            folder_id = inserted.data[0]["id"]
            by_name[folder.name] = folder_id
        supabase.table("assets").update(
            {"folder_id": folder_id, "status": "organized"}
        ).in_("id", folder.asset_ids).execute()
        created.append({"id": folder_id, "name": folder.name, "count": len(folder.asset_ids)})
    return {"folders": created}
