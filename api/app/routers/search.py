from fastapi import APIRouter
from pydantic import BaseModel

from app.services.embeddings import embed_text
from app.supabase_client import get_supabase

router = APIRouter(prefix="/search", tags=["search"])


class SearchRequest(BaseModel):
    query: str
    limit: int = 10


@router.post("")
def search(request: SearchRequest):
    embedding = embed_text(request.query)
    if embedding is None:
        return {"results": []}

    supabase = get_supabase()
    result = supabase.rpc(
        "match_assets",
        {"query_embedding": embedding, "match_count": request.limit},
    ).execute()
    return {"results": result.data}
