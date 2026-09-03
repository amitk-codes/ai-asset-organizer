from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.auth import generate_key, get_user_id, hash_key
from app.supabase_client import get_supabase

router = APIRouter(prefix="/auth", tags=["auth"])


class KeyRequest(BaseModel):
    key: str


@router.post("/signup")
def signup():
    key = generate_key()
    supabase = get_supabase()
    supabase.table("users").insert({"key_hash": hash_key(key)}).execute()
    return {"key": key}


@router.post("/login")
def login(request: KeyRequest):
    supabase = get_supabase()
    result = (
        supabase.table("users").select("id").eq("key_hash", hash_key(request.key)).execute()
    )
    if not result.data:
        raise HTTPException(status_code=401, detail="invalid key")
    return {"ok": True}


@router.post("/rotate")
def rotate(user_id: str = Depends(get_user_id)):
    key = generate_key()
    supabase = get_supabase()
    supabase.table("users").update({"key_hash": hash_key(key)}).eq("id", user_id).execute()
    return {"key": key}
