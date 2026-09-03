# Deployment

Everything runs on free tiers. Accounts needed: Supabase, Google AI Studio (Gemini), Groq, Vercel,
Hugging Face.

## 1. Supabase — database + storage
- Create a project.
- Open the SQL editor and run the migrations in order:
  `0001_init.sql`, `0002_search.sql`, `0003_shares.sql`, then `0004_auth.sql`.
- Copy your Project URL and the `service_role` key (Settings → API).

## 2. API keys
- **Gemini:** aistudio.google.com → create an API key.
- **Groq:** console.groq.com → create an API key.

## 3. Backend — FastAPI on Hugging Face Spaces
- Create a Space with the **Docker** SDK and push the `api/` folder (it ships a `Dockerfile`).
- Set Space secrets: `GROQ_API_KEY`, `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`,
  and `ALLOWED_ORIGINS` (your Vercel URL).
- The container listens on port 7860 (the HF Spaces default) — the included `Dockerfile` handles this.
- Note: free Spaces sleep when idle — the first request after a pause takes ~30–50s.

## 4. Frontend — Next.js on Vercel
- Import the repo and set the root directory to `web/`.
- Env vars: `NEXT_PUBLIC_API_URL` (your Space URL), `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Deploy.

## 5. Connect them
- Put the Vercel URL into the backend's `ALLOWED_ORIGINS` so CORS allows the frontend.
- That's it.
