-- Run this once in the Supabase SQL editor.
-- Liked songs belong to the signed-in account. Guests stay in the browser.

create table if not exists public.liked_songs (
  user_id uuid not null references auth.users (id) on delete cascade,
  track_id bigint not null,
  track jsonb not null,
  created_at timestamptz not null default now(),
  primary key (user_id, track_id)
);

alter table public.liked_songs enable row level security;

create policy "Read own liked songs"
  on public.liked_songs
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Add own liked songs"
  on public.liked_songs
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Update own liked songs"
  on public.liked_songs
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Remove own liked songs"
  on public.liked_songs
  for delete
  to authenticated
  using (auth.uid() = user_id);
