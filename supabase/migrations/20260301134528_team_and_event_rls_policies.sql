drop view if exists "public"."event_step_totals";

alter table "public"."daily_steps" drop column "stepdate";

alter table "public"."daily_steps" add column "date" date;

alter table "public"."daily_steps" add column "totaldailysteps" bigint;

alter table "public"."events" add column "owner_id" uuid not null;

alter table "public"."events" enable row level security;

alter table "public"."teams" add column "owner_id" uuid not null;

CREATE UNIQUE INDEX teams_owner_id_key ON public.teams USING btree (owner_id);

alter table "public"."events" add constraint "events_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES public.profiles(profile_id) not valid;

alter table "public"."events" validate constraint "events_owner_id_fkey";

alter table "public"."teams" add constraint "teams_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES public.profiles(profile_id) not valid;

alter table "public"."teams" validate constraint "teams_owner_id_fkey";

alter table "public"."teams" add constraint "teams_owner_id_key" UNIQUE using index "teams_owner_id_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.decrement_team_size()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$BEGIN
  IF OLD.team_id IS NOT NULL AND NEW.team_id IS NULL THEN
    UPDATE public.teams
    SET size = size - 1
    WHERE id = OLD.team_id;
  END IF;

  RETURN NEW;
END;$function$
;

CREATE OR REPLACE FUNCTION public.increment_team_size()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$BEGIN
  IF NEW.team_id IS DISTINCT FROM OLD.team_id AND NEW.team_id IS NOT NULL THEN
    UPDATE public.teams
    SET size = size + 1
    WHERE id = NEW.team_id;
  END IF;

  RETURN NEW;
END;$function$
;

CREATE OR REPLACE FUNCTION public.join_team_after_create()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$BEGIN
  UPDATE public.profiles
  SET team_id = NEW.id
  WHERE profile_id = NEW.owner_id;

  RETURN NEW;
END;$function$
;

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


  create policy "Delete for event owner only"
  on "public"."events"
  as permissive
  for delete
  to authenticated
using ((( SELECT auth.uid() AS uid) = owner_id));



  create policy "Enable read access for all users"
  on "public"."events"
  as permissive
  for select
  to authenticated, anon
using (true);



  create policy "Insert for Organizers only"
  on "public"."events"
  as permissive
  for insert
  to authenticated
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.profile_id = ( SELECT auth.uid() AS uid)) AND (profiles.role = 1)))));



  create policy "Update for event owner only"
  on "public"."events"
  as permissive
  for update
  to authenticated
using (( SELECT (( SELECT auth.uid() AS uid) = events.owner_id)));



  create policy "Enable delete for users based on owner_id"
  on "public"."teams"
  as permissive
  for delete
  to authenticated
using ((( SELECT auth.uid() AS uid) = owner_id));



  create policy "Enable insert for authenticated users only"
  on "public"."teams"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Enable read access for all users"
  on "public"."teams"
  as permissive
  for select
  to public
using (true);



  create policy "Update only if in team"
  on "public"."teams"
  as permissive
  for update
  to public
using ((id = ( SELECT profiles.team_id
   FROM public.profiles
  WHERE (profiles.profile_id = ( SELECT auth.uid() AS uid)))))
with check ((id = ( SELECT profiles.team_id
   FROM public.profiles
  WHERE (profiles.profile_id = ( SELECT auth.uid() AS uid)))));


CREATE TRIGGER trg_decrement_team_size_before_profile_teamid_update BEFORE UPDATE OF team_id ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.decrement_team_size();

CREATE TRIGGER trg_increment_team_size_after_profile_teamid_update AFTER UPDATE OF team_id ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.increment_team_size();

CREATE TRIGGER trg_team_owner_join AFTER INSERT ON public.teams FOR EACH ROW EXECUTE FUNCTION public.join_team_after_create();


