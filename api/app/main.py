from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import assets, folders, organize, search, share

app = FastAPI(title="AI Asset Organizer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(assets.router)
app.include_router(folders.router)
app.include_router(organize.router)
app.include_router(search.router)
app.include_router(share.router)


@app.get("/health")
def health():
    return {"status": "ok"}
