create table users (
    id uuid primary key default gen_random_uuid(),
    key_hash text unique not null,
    created_at timestamptz not null default now()
);
alter table users enable row level security;

-- every asset and folder now belongs to a user
alter table assets add column user_id uuid references users(id) on delete cascade;
alter table folders add column user_id uuid references users(id) on delete cascade;

create index assets_user_idx on assets(user_id);
create index folders_user_idx on folders(user_id);

-- search is now scoped to the owner
drop function if exists match_assets(vector, integer);

create or replace function match_assets(
    query_embedding vector(768),
    match_count int default 10,
    owner uuid default null
)
returns table (
    id uuid,
    filename text,
    mime_type text,
    folder_id uuid,
    similarity float
)
language sql stable
as $$
    select
        a.id,
        a.filename,
        a.mime_type,
        a.folder_id,
        1 - (a.embedding <=> query_embedding) as similarity
    from assets a
    where a.embedding is not null
      and (owner is null or a.user_id = owner)
    order by a.embedding <=> query_embedding
    limit match_count;
$$;
