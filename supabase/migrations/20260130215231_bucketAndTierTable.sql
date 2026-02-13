alter table "public"."tiers" add column "icon_urls" text[];

insert into storage.buckets
  (id, name, public, file_size_limit, allowed_mime_types)
values 
  ('event-tier-icons', 'event-tier-icons', true, 2097152, array['image/png', 'image/jpeg']),
  ('banner-images', 'banner-images', true, 2097152, array['image/png', 'image/jpeg'])
on conflict (id) do nothing;

  create policy "Allow banner image upload 1uz6zi1_0"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check ((bucket_id = 'banner-images'::text));



  create policy "Allow tier icon upload 2ocsqq_0"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check ((bucket_id = 'event-tier-icons'::text));



