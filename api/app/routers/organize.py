from fastapi import APIRouter

from app.services.organizer import suggest_folders
from app.supabase_client import get_supabase

router = APIRouter(prefix="/organize", tags=["organize"])


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
