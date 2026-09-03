-- cosine-similarity search over asset embeddings
create or replace function match_assets(
    query_embedding vector(768),
    match_count int default 10
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
    order by a.embedding <=> query_embedding
    limit match_count;
$$;
