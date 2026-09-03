create table shares (
    id uuid primary key default gen_random_uuid(),
    target_type text not null check (target_type in ('folder', 'asset')),
    target_id uuid not null,
    created_at timestamptz not null default now()
);
