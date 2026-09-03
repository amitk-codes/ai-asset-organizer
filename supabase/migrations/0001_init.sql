-- pgvector powers the semantic search
create extension if not exists vector;

create table folders (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    created_at timestamptz not null default now()
);

create table assets (
    id uuid primary key default gen_random_uuid(),
    folder_id uuid references folders(id) on delete set null,
    filename text not null,
    storage_path text not null,
    mime_type text,
    size_bytes bigint,
    content_text text,          -- extracted text / vision caption, used for search + organizing
    summary text,
    embedding vector(768),      -- Gemini text-embedding-004 dimension
    status text not null default 'uploaded',
    created_at timestamptz not null default now()
);

-- approximate nearest-neighbour index for cosine similarity
create index assets_embedding_idx on assets using hnsw (embedding vector_cosine_ops);

-- files live in a private bucket; the backend serves them via signed URLs
insert into storage.buckets (id, name, public)
values ('assets', 'assets', false)
on conflict (id) do nothing;
