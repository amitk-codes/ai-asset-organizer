# AI Asset Organizer

Upload your files and let AI do the filing. Assets are understood, grouped into a suggested folder
structure you approve, and made searchable in plain English — "show me the invoices from March".

> Status: in active development.

## Highlights

- **Understands your assets** — images (vision) and PDFs (text) are read, not just stored.
- **Suggest-and-confirm organizing** — an AI agent proposes folders; you stay in control.
- **Semantic search (RAG)** — find things by meaning, not filename.
- **Shareable** — share a folder or a single asset with a link.
- **MCP server** — the organizer's capabilities are exposed as tools over the Model Context Protocol.

## Tech

| | |
|---|---|
| Frontend | Next.js, Tailwind, shadcn/ui, next-themes (dark/light) |
| Backend | FastAPI (Python) |
| Data | Supabase — Postgres + pgvector + Storage |
| AI | Groq (Llama, agent/chat) · Gemini (vision + embeddings) |

Two models by design: Gemini reads images/PDFs, Groq handles fast reasoning and chat — the right
model for each job.

## Structure

```
.
├── web/    # Next.js frontend
└── api/    # FastAPI backend
```

## Getting started

Setup and deployment instructions are documented as the project takes shape. See `api/` and `web/`.
