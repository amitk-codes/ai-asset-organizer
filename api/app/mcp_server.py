from mcp.server.fastmcp import FastMCP

from app.services.embeddings import embed_text
from app.services.organizer import suggest_folders as _suggest_folders
from app.supabase_client import get_supabase

mcp = FastMCP("ai-asset-organizer")


@mcp.tool()
def list_assets() -> list[dict]:
    """List all stored assets, newest first."""
    supabase = get_supabase()
    result = (
        supabase.table("assets")
        .select("id, filename, mime_type, folder_id, status")
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


@mcp.tool()
def search_assets(query: str, limit: int = 10) -> list[dict]:
    """Semantically search assets by meaning and return the closest matches."""
    embedding = embed_text(query)
    if embedding is None:
        return []
    supabase = get_supabase()
    result = supabase.rpc(
        "match_assets", {"query_embedding": embedding, "match_count": limit}
    ).execute()
    return result.data


@mcp.tool()
def suggest_folders() -> list[dict]:
    """Propose a folder structure for assets that aren't organized yet."""
    supabase = get_supabase()
    result = (
        supabase.table("assets")
        .select("id, filename, content_text")
        .is_("folder_id", "null")
        .execute()
    )
    return _suggest_folders(result.data)


if __name__ == "__main__":
    mcp.run()
