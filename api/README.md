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

## MCP server

The organizer's capabilities are also exposed over the Model Context Protocol, so an MCP client
(e.g. Claude Desktop) can use them as tools:

```bash
python -m app.mcp_server
```

Tools: `list_assets`, `search_assets`, `suggest_folders`.
