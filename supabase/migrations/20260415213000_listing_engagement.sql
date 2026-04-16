create table if not exists public.saved_listings (
  user_id uuid not null references auth.users (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, listing_id)
);

create table if not exists public.listing_reports (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  reporter_user_id uuid not null references auth.users (id) on delete cascade,
  reason text not null,
  notes text not null default '',
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.saved_listings enable row level security;
alter table public.listing_reports enable row level security;

create policy "Users can read their own saved listings"
  on public.saved_listings
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can save listings for themselves"
  on public.saved_listings
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can remove their own saved listings"
  on public.saved_listings
  for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can read their own reports"
  on public.listing_reports
  for select
  to authenticated
  using (auth.uid() = reporter_user_id);

create policy "Users can report listings"
  on public.listing_reports
  for insert
  to authenticated
  with check (auth.uid() = reporter_user_id);
