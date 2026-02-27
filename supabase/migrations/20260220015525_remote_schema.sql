drop view if exists "public"."event_step_totals";

alter table "public"."daily_steps" drop column "stepdate";

alter table "public"."daily_steps" add column "date" date;

alter table "public"."daily_steps" add column "totaldailysteps" bigint;

alter table "public"."profiles" enable row level security;

alter table "public"."tiers" drop column "icon_urls";

CREATE UNIQUE INDEX profiles_username_key ON public.profiles USING btree (username);

alter table "public"."profiles" add constraint "profiles_username_key" UNIQUE using index "profiles_username_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.assign_tier_after_leaderboard_update()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    new_tier TEXT;
BEGIN
    SELECT tier_name INTO new_tier
    FROM tiers
    WHERE NEW.total_steps >= min_steps
    ORDER BY min_steps DESC
    LIMIT 1;

    UPDATE profiles
    SET tier_name = new_tier
    WHERE profile_id = NEW.profile_id;

    RETURN NEW;
END;
$function$
;

create or replace view "public"."event_step_totals" as  SELECT profiles.profile_id,
    daily_steps.event_id,
    (daily_steps.dailysteps + profiles.total_steps) AS summed_steps
   FROM public.daily_steps,
    public.profiles;


CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$BEGIN
  INSERT INTO public.profiles (profile_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;$function$
;

CREATE OR REPLACE FUNCTION public.update_leaderboard_after_daily_steps()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    INSERT INTO leaderboard (profile_id, total_steps, last_updated)
    VALUES (NEW.profile_id, NEW.steps, NOW())
    ON CONFLICT (profile_id) DO UPDATE
        SET total_steps = leaderboard.total_steps + EXCLUDED.total_steps,
            last_updated = NOW();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.validate_daily_steps()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF NEW.steps < 0 OR NEW.steps > 100000 THEN
        RAISE EXCEPTION 'Invalid step count: %', NEW.steps;
    END IF;
    RETURN NEW;
END;
$function$
;

drop policy "Allow tier icon upload 2ocsqq_0" on "storage"."objects";


  create policy "Allow event tier icon upload 2ocsqq_0"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check ((bucket_id = 'event-tier-icons'::text));



-- CREATE TRIGGER protect_buckets_delete BEFORE DELETE ON storage.buckets FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();

-- CREATE TRIGGER protect_objects_delete BEFORE DELETE ON storage.objects FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


