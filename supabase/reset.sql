-- ⚠️  DESTRUCTIVE — WIPES EVERYTHING for AI Asset Organizer.
-- Drops all app tables, the search function, the storage bucket + its files,
-- and the pgvector extension. This CANNOT be undone.
--
-- Run in: Supabase Dashboard → SQL Editor → paste → Run.
-- AFTER running this, the app will NOT work until you re-run the migrations
-- 0001_init.sql → 0002_search.sql → 0003_shares.sql → 0004_auth.sql → 0005_shares_meta.sql

-- NOTE: the 'assets' storage bucket + its files must be cleared via the Storage
-- API (Supabase blocks direct deletes on storage tables). Do that first, then:

-- App tables (cascade clears foreign keys, indexes and policies)
drop table if exists shares cascade;
drop table if exists assets cascade;
drop table if exists folders cascade;
drop table if exists users cascade;

-- 3. Semantic-search function (both historical signatures)
drop function if exists match_assets(vector, integer, uuid);
drop function if exists match_assets(vector, integer);

-- 4. pgvector extension
drop extension if exists vector cascade;
