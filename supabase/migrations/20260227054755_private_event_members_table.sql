alter table "public"."profiles" drop constraint "profiles_username_key";

drop view if exists "public"."event_step_totals";

drop index if exists "public"."profiles_username_key";


  create table "public"."private_event_members" (
    "id" uuid not null default gen_random_uuid(),
    "event_id" uuid,
    "email" text not null
      );


alter table "public"."daily_steps" drop column "date";

alter table "public"."daily_steps" drop column "totaldailysteps";

alter table "public"."daily_steps" add column "stepdate" date;

alter table "public"."daily_steps" disable row level security;

alter table "public"."teams" enable row level security;

alter table "public"."tiers" add column "icon_urls" text[];

CREATE UNIQUE INDEX private_event_members_pkey ON public.private_event_members USING btree (id);

CREATE UNIQUE INDEX unique_event_email ON public.private_event_members USING btree (event_id, email);

alter table "public"."private_event_members" add constraint "private_event_members_pkey" PRIMARY KEY using index "private_event_members_pkey";

alter table "public"."private_event_members" add constraint "private_event_members_event_id_fkey" FOREIGN KEY (event_id) REFERENCES public.events(event_id) ON DELETE CASCADE not valid;

alter table "public"."private_event_members" validate constraint "private_event_members_event_id_fkey";

create or replace view "public"."event_step_totals" as  SELECT profiles.profile_id,
    daily_steps.event_id,
    (daily_steps.dailysteps + profiles.total_steps) AS summed_steps
   FROM public.daily_steps,
    public.profiles;


grant delete on table "public"."private_event_members" to "anon";

grant insert on table "public"."private_event_members" to "anon";

grant references on table "public"."private_event_members" to "anon";

grant select on table "public"."private_event_members" to "anon";

grant trigger on table "public"."private_event_members" to "anon";

grant truncate on table "public"."private_event_members" to "anon";

grant update on table "public"."private_event_members" to "anon";

grant delete on table "public"."private_event_members" to "authenticated";

grant insert on table "public"."private_event_members" to "authenticated";

grant references on table "public"."private_event_members" to "authenticated";

grant select on table "public"."private_event_members" to "authenticated";

grant trigger on table "public"."private_event_members" to "authenticated";

grant truncate on table "public"."private_event_members" to "authenticated";

grant update on table "public"."private_event_members" to "authenticated";

grant delete on table "public"."private_event_members" to "service_role";

grant insert on table "public"."private_event_members" to "service_role";

grant references on table "public"."private_event_members" to "service_role";

grant select on table "public"."private_event_members" to "service_role";

grant trigger on table "public"."private_event_members" to "service_role";

grant truncate on table "public"."private_event_members" to "service_role";

grant update on table "public"."private_event_members" to "service_role";

drop trigger if exists "objects_delete_delete_prefix" on "storage"."objects";

drop trigger if exists "objects_insert_create_prefix" on "storage"."objects";

drop trigger if exists "objects_update_create_prefix" on "storage"."objects";

-- drop trigger if exists "prefixes_create_hierarchy" on "storage"."prefixes";

-- drop trigger if exists "prefixes_delete_hierarchy" on "storage"."prefixes";

insert into storage.buckets
  (id, name, public, file_size_limit, allowed_mime_types)
values 
  ('private_event_lists', 'private_event_lists', true, 2097152, array['text/csv'])
on conflict (id) do nothing;

drop policy "Allow event tier icon upload 2ocsqq_0" on "storage"."objects";


  create policy "Allow private event participant lists upload 1onu9g_0"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check ((bucket_id = 'private_event_lists'::text));



  create policy "Allow tier icon upload 2ocsqq_0"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check ((bucket_id = 'event-tier-icons'::text));


-- CREATE TRIGGER protect_buckets_delete BEFORE DELETE ON storage.buckets FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();

-- CREATE TRIGGER protect_objects_delete BEFORE DELETE ON storage.objects FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();

