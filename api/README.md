# API

FastAPI backend for AI Asset Organizer.

## Run locally

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# copy env and fill in keys
cp ../.env.example .env

uvicorn app.main:app --reload
```

Health check: http://localhost:8000/health
