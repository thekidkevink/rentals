create extension if not exists pgcrypto;

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  city text not null,
  suburb text not null,
  property_type text not null,
  rent_amount integer not null check (rent_amount >= 0),
  deposit_amount integer not null default 0 check (deposit_amount >= 0),
  furnished boolean not null default false,
  utilities_included text[] not null default '{}',
  available_from date not null default current_date,
  image_url text not null,
  whatsapp_number text not null,
  poster_name text not null,
  status text not null default 'active' check (status in ('active', 'rented', 'inactive')),
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.listings enable row level security;

create policy "Listings are viewable by everyone"
  on public.listings
  for select
  using (true);
