from fastapi import APIRouter

from app.supabase_client import get_supabase

router = APIRouter(prefix="/folders", tags=["folders"])


@router.get("")
def list_folders():
    supabase = get_supabase()
    # embedded aggregate: each folder carries a count of its related assets
    result = (
        supabase.table("folders")
        .select("id, name, assets(count)")
        .order("name")
        .execute()
    )

    folders = []
    for row in result.data:
        related = row.get("assets") or [{}]
        folders.append({
            "id": row["id"],
            "name": row["name"],
            "count": related[0].get("count", 0),
        })
    return folders
