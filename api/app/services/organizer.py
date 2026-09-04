import json

from google.genai import types

from app.gemini_client import get_gemini, with_retry

# flash-lite has a far more generous free-tier daily quota than flash-latest
MODEL = "gemini-flash-lite-latest"

_SYSTEM = (
    "You are a file organizer. Group the files into clear, SPECIFIC folders based on what each file "
    "is actually about — its subject or content — not by generic type.\n"
    "Rules:\n"
    "- Name folders by the specific subject/topic. Strongly prefer names like 'Cars', 'Nature', "
    "'Food', 'Invoices', 'Receipts', 'Screenshots', 'ID Documents', 'Resumes' over vague buckets "
    "like 'Photos', 'Images', 'Files' or 'Documents'.\n"
    "- Group genuinely similar files together. A folder may hold a single file if nothing else "
    "matches it — that is better than lumping unrelated things into one generic folder.\n"
    "- Keep names short and human. Put every file into exactly one folder, using its id.\n"
    "- If existing folders are provided, REUSE a matching one instead of inventing a near-duplicate.\n"
    'Return ONLY JSON of the form: {"folders": [{"name": string, "asset_ids": [string]}]}'
)


def suggest_folders(assets: list[dict], existing_names: list[str] | None = None) -> list[dict]:
    if not assets:
        return []

    catalog = [
        {
            "id": a["id"],
            "filename": a.get("filename"),
            "description": (a.get("content_text") or "")[:600],
        }
        for a in assets
    ]

    user = "Files to organize:\n" + json.dumps(catalog, ensure_ascii=False)
    if existing_names:
        user += "\n\nExisting folders — reuse one of these when a file fits it: " + json.dumps(
            existing_names
        )

    client = get_gemini()
    response = with_retry(
        lambda: client.models.generate_content(
            model=MODEL,
            contents=user,
            config=types.GenerateContentConfig(
                system_instruction=_SYSTEM,
                response_mime_type="application/json",
                temperature=0.2,
            ),
        )
    )
    payload = json.loads(response.text or "{}")
    return payload.get("folders", [])
