# Supabase

Database schema and storage for AI Asset Organizer.

## Apply

Paste `migrations/0001_init.sql` into the Supabase **SQL editor** and run it
(or, with the Supabase CLI: `supabase db push`).

It sets up:
- `folders` and `assets` tables
- the `vector` extension + an HNSW index for semantic search
- a private `assets` storage bucket
