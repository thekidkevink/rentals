alter table public.listings
add column if not exists user_id uuid references auth.users (id) on delete cascade;

drop policy if exists "Listings are viewable by everyone" on public.listings;

create policy "Active listings are viewable by everyone"
  on public.listings
  for select
  using (status = 'active' or auth.uid() = user_id);

create policy "Authenticated users can create their own listings"
  on public.listings
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Authenticated users can update their own listings"
  on public.listings
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Authenticated users can delete their own listings"
  on public.listings
  for delete
  to authenticated
  using (auth.uid() = user_id);
