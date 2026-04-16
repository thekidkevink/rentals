insert into public.listings (
  title,
  description,
  city,
  suburb,
  property_type,
  rent_amount,
  deposit_amount,
  furnished,
  utilities_included,
  available_from,
  image_url,
  whatsapp_number,
  poster_name,
  status
)
select *
from (
  values
    (
      'Sunny room near UNAM with WiFi included',
      'A bright room in a quiet shared house with prepaid electricity, fast WiFi, and easy taxi access. Best for students or a young professional.',
      'Windhoek',
      'Pioneers Park',
      'Room',
      3200,
      3200,
      true,
      array['WiFi', 'Water']::text[],
      date '2026-05-01',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
      '+264811234567',
      'Martha K',
      'active'
    ),
    (
      'Affordable bachelor flat close to CBD routes',
      'Compact bachelor unit with its own bathroom and kitchenette. Ideal for someone who wants privacy and quick transport into town.',
      'Windhoek',
      'Katutura',
      'Bachelor',
      4100,
      2000,
      false,
      array['Water']::text[],
      date '2026-04-20',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
      '+264811234568',
      'Joel P',
      'active'
    ),
    (
      'Shared apartment with secure parking',
      'One room available in a neat shared apartment. Parking, built-in cupboards, and a calm environment for working professionals.',
      'Windhoek',
      'Khomasdal',
      'Shared',
      2900,
      1500,
      false,
      array['Water', 'Electricity']::text[],
      date '2026-05-10',
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
      '+264811234569',
      'Nelia S',
      'active'
    )
) as seeded_rows (
  title,
  description,
  city,
  suburb,
  property_type,
  rent_amount,
  deposit_amount,
  furnished,
  utilities_included,
  available_from,
  image_url,
  whatsapp_number,
  poster_name,
  status
)
where not exists (
  select 1
  from public.listings existing
  where existing.title = seeded_rows.title
);
