import json

from app.config import settings
from app.groq_client import get_groq

_SYSTEM = (
    "You organize files into a small, sensible set of folders. "
    "Given a list of assets (id, filename, short description), group them into 3-8 folders "
    "with clear human names (e.g. 'Invoices', 'Screenshots', 'Contracts'). "
    "Assign every asset to exactly one folder. "
    'Respond as JSON: {"folders": [{"name": string, "asset_ids": [string]}]}.'
)


def suggest_folders(assets: list[dict]) -> list[dict]:
    if not assets:
        return []

    # keep the prompt small — a trimmed description is enough to group by
    catalog = [
        {
            "id": a["id"],
            "filename": a.get("filename"),
            "description": (a.get("content_text") or "")[:400],
        }
        for a in assets
    ]

    client = get_groq()
    response = client.chat.completions.create(
        model=settings.groq_model,
        messages=[
            {"role": "system", "content": _SYSTEM},
            {"role": "user", "content": json.dumps(catalog)},
        ],
        response_format={"type": "json_object"},
        temperature=0.2,
    )
    payload = json.loads(response.choices[0].message.content)
    return payload.get("folders", [])
