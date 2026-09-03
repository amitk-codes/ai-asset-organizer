from app.supabase_client import get_supabase

BUCKET = "assets"
SIGNED_URL_TTL = 3600  # seconds


def sign_paths(paths: list[str]) -> dict[str, str | None]:
    """Batch-sign storage paths into short-lived URLs, keyed by path."""
    if not paths:
        return {}
    supabase = get_supabase()
    try:
        signed = supabase.storage.from_(BUCKET).create_signed_urls(paths, SIGNED_URL_TTL)
    except Exception:
        return {path: None for path in paths}
    return {
        item.get("path"): (item.get("signedURL") or item.get("signedUrl"))
        for item in signed
    }
