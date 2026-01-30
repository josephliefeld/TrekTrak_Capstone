alter table "public"."tiers" add column "icon_urls" text[];


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



