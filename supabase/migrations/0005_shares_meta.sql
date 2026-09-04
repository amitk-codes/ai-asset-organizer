-- Share ownership, expiry and revocation.
-- Existing rows get user_id = null (invisible in "my shares") but still resolve.
alter table shares add column if not exists user_id uuid references users(id) on delete cascade;
alter table shares add column if not exists expires_at timestamptz;
alter table shares add column if not exists revoked boolean not null default false;

create index if not exists shares_user_idx on shares(user_id);
