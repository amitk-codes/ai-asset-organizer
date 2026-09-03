from fastapi import APIRouter, Depends, HTTPException

from app.auth import get_user_id
from app.supabase_client import get_supabase

router = APIRouter(prefix="/folders", tags=["folders"])


@router.get("")
def list_folders(user_id: str = Depends(get_user_id)):
    supabase = get_supabase()
    # embedded aggregate: each folder carries a count of its related assets
    result = (
        supabase.table("folders")
        .select("id, name, assets(count)")
        .eq("user_id", user_id)
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


@router.delete("/{folder_id}")
def delete_folder(folder_id: str, user_id: str = Depends(get_user_id)):
    supabase = get_supabase()
    found = (
        supabase.table("folders").select("id").eq("id", folder_id).eq("user_id", user_id).execute()
    )
    if not found.data:
        raise HTTPException(status_code=404, detail="folder not found")

    # keep the files — just move them out of the folder
    supabase.table("assets").update({"folder_id": None, "status": "processed"}).eq(
        "folder_id", folder_id
    ).eq("user_id", user_id).execute()
    supabase.table("folders").delete().eq("id", folder_id).eq("user_id", user_id).execute()
    return {"ok": True}
