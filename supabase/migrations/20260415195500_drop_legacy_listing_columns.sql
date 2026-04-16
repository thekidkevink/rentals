do $$
begin
  if exists (select 1 from public.listings where property_type_id is null or city_id is null or area_id is null or contact_id is null) then
    raise exception 'Cannot drop legacy listing columns until all listings are backfilled into normalized relations.';
  end if;
end
$$;

alter table public.listings
alter column property_type_id set not null,
alter column city_id set not null,
alter column area_id set not null,
alter column contact_id set not null;

alter table public.listings
drop column if exists property_type,
drop column if exists city,
drop column if exists suburb,
drop column if exists utilities_included,
drop column if exists image_url,
drop column if exists whatsapp_number,
drop column if exists poster_name;
