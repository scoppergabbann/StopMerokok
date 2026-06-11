alter table profiles
add column if not exists cigarette_brands text[] not null default '{}';

update profiles
set cigarette_brands = array(
  select distinct trim(brand)
  from unnest(string_to_array(coalesce(cigarette_brand, ''), ',')) as brand
  where trim(brand) <> ''
)
where cardinality(cigarette_brands) = 0
  and coalesce(cigarette_brand, '') <> '';
