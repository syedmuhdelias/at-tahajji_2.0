-- Run in Supabase SQL Editor as the project owner.
-- First create at-tahajji@test.com under Authentication > Users, with a password.
-- Uses separate myquran_* tables; does not change the old website's tables.
begin;
create table if not exists public.myquran_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.myquran_admins enable row level security;
revoke all on public.myquran_admins from anon, authenticated;
grant select on public.myquran_admins to authenticated;
drop policy if exists myquran_admin_self on public.myquran_admins;
create policy myquran_admin_self on public.myquran_admins for select to authenticated
  using (user_id = (select auth.uid()));

do $$
declare admin_id uuid;
begin
  select id into admin_id from auth.users where lower(email) = 'at-tahajji@test.com';
  if admin_id is null then
    raise exception 'Create at-tahajji@test.com in Authentication > Users first, then run this SQL again.';
  end if;
  insert into public.myquran_admins(user_id) values (admin_id) on conflict do nothing;
end $$;

create table if not exists public.myquran_content (
  id integer primary key check (id = 1),
  content jsonb not null,
  revision integer not null default 0 check (revision >= 0),
  updated_at timestamptz not null default now()
);
alter table public.myquran_content enable row level security;
revoke all on public.myquran_content from anon, authenticated;
grant select on public.myquran_content to anon, authenticated;
drop policy if exists myquran_content_public_read on public.myquran_content;
create policy myquran_content_public_read on public.myquran_content for select to anon, authenticated using (true);

-- Only this function may write. Concurrent editors must submit the current revision.
create or replace function public.myquran_save_content(new_content jsonb, expected_revision integer)
returns setof public.myquran_content
language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.myquran_admins where user_id = (select auth.uid())) then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;
  if expected_revision < 0 or expected_revision is null or new_content is null
    or jsonb_typeof(new_content) <> 'object' or octet_length(new_content::text) > 200000 then
    raise exception 'Invalid content';
  end if;
  if expected_revision = 0 then
    insert into public.myquran_content(id, content, revision) values (1, new_content, 0) on conflict do nothing;
  end if;
  return query update public.myquran_content c
    set content = new_content, revision = c.revision + 1, updated_at = now()
    where c.id = 1 and c.revision = expected_revision returning c.*;
end $$;
revoke all on function public.myquran_save_content(jsonb, integer) from public, anon;
grant execute on function public.myquran_save_content(jsonb, integer) to authenticated;

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('myquran-media', 'myquran-media', true, 5242880, array['image/png','image/jpeg','image/webp'])
on conflict (id) do nothing;
drop policy if exists myquran_media_admin_insert on storage.objects;
create policy myquran_media_admin_insert on storage.objects for insert to authenticated
with check (bucket_id = 'myquran-media' and exists (
  select 1 from public.myquran_admins where user_id = (select auth.uid())
));
commit;
