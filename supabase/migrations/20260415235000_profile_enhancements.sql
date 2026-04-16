alter table public.profiles
add column if not exists avatar_url text,
add column if not exists bio text not null default '',
add column if not exists account_type text not null default 'renter'
  check (account_type in ('renter', 'landlord', 'agent', 'roommate'));

update public.profiles
set
  bio = coalesce(bio, ''),
  account_type = coalesce(account_type, 'renter');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-images',
  'profile-images',
  true,
  3145728,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Profile images bucket is publicly readable"
  on storage.objects
  for select
  using (bucket_id = 'profile-images');

create policy "Authenticated users can upload their profile images"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'profile-images'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "Authenticated users can update their profile images"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'profile-images'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  )
  with check (
    bucket_id = 'profile-images'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "Authenticated users can delete their profile images"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'profile-images'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );
