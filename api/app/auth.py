import hashlib
import secrets

from fastapi import Header, HTTPException

from app.supabase_client import get_supabase


def generate_key() -> str:
    return "key_" + secrets.token_urlsafe(18)


def hash_key(key: str) -> str:
    return hashlib.sha256(key.encode()).hexdigest()


def get_user_id(x_api_key: str = Header(default="")) -> str:
    """Resolve the workspace key from the X-Api-Key header to a user id."""
    if not x_api_key:
        raise HTTPException(status_code=401, detail="missing key")
    supabase = get_supabase()
    result = supabase.table("users").select("id").eq("key_hash", hash_key(x_api_key)).execute()
    if not result.data:
        raise HTTPException(status_code=401, detail="invalid key")
    return result.data[0]["id"]
