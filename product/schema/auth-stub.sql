-- Local stand-in for Supabase's auth.uid(). Not for production.
-- Set the acting user with: select set_config('app.uid', '<uuid>', false);
create schema if not exists auth;
create or replace function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('app.uid', true), '')::uuid
$$;
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'app') then create role app nosuperuser nologin; end if;
end $$;
