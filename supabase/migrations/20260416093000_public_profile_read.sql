create policy "Profiles are viewable by everyone"
  on public.profiles
  for select
  using (true);
