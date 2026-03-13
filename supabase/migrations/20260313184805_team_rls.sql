create extension if not exists "hypopg" with schema "extensions";

create extension if not exists "index_advisor" with schema "extensions";

drop policy "Update only if in team" on "public"."teams";

alter table "public"."tiers" drop constraint "tiers_event_id_fkey";


  create table "public"."max_size" (
    "max_team_size" bigint
      );


alter table "public"."events" add column "allow_teams" boolean;

alter table "public"."events" add column "max_team_size" bigint;

alter table "public"."tiers" add constraint "tiers_event_id_fkey" FOREIGN KEY (event_id) REFERENCES public.events(event_id) ON DELETE CASCADE not valid;

alter table "public"."tiers" validate constraint "tiers_event_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.check_team_size()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$DECLARE
  max_size integer;
  member_count integer;
BEGIN
  -- skip checks if leaving team
  IF NEW.team_id IS NULL THEN
    RETURN NEW;
  END IF;
  -- lock the team row to serialize concurrent changes
  PERFORM 1
  FROM public.teams
  WHERE id = NEW.team_id
  FOR UPDATE;

  -- get the max size for the event this team belongs to
  SELECT e.max_team_size
  INTO max_size
  FROM public.teams t
  JOIN public.events e ON e.event_id = t.event_id
  WHERE t.id = NEW.team_id;

  IF max_size IS NULL THEN
    RAISE EXCEPTION 'team % has no associated event or max_team_size is NULL', NEW.team_id;
  END IF;

  -- count members currently in the team
  SELECT COUNT(*)
  INTO member_count
  FROM public.profiles
  WHERE team_id = NEW.team_id;

  IF TG_OP = 'INSERT' THEN
    member_count := member_count + 1;

  ELSIF TG_OP = 'UPDATE' THEN
    -- if moving teams, count accordingly
    IF COALESCE(OLD.team_id::text, '') <> COALESCE(NEW.team_id::text, '') THEN
      member_count := member_count + 1;
    END IF;
  END IF;

  IF member_count > max_size THEN
    RAISE EXCEPTION 'team % is full (% > %)', NEW.team_id, member_count, max_size;
  END IF;

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

grant delete on table "public"."max_size" to "anon";

grant insert on table "public"."max_size" to "anon";

grant references on table "public"."max_size" to "anon";

grant select on table "public"."max_size" to "anon";

grant trigger on table "public"."max_size" to "anon";

grant truncate on table "public"."max_size" to "anon";

grant update on table "public"."max_size" to "anon";

grant delete on table "public"."max_size" to "authenticated";

grant insert on table "public"."max_size" to "authenticated";

grant references on table "public"."max_size" to "authenticated";

grant select on table "public"."max_size" to "authenticated";

grant trigger on table "public"."max_size" to "authenticated";

grant truncate on table "public"."max_size" to "authenticated";

grant update on table "public"."max_size" to "authenticated";

grant delete on table "public"."max_size" to "service_role";

grant insert on table "public"."max_size" to "service_role";

grant references on table "public"."max_size" to "service_role";

grant select on table "public"."max_size" to "service_role";

grant trigger on table "public"."max_size" to "service_role";

grant truncate on table "public"."max_size" to "service_role";

grant update on table "public"."max_size" to "service_role";


  create policy "Update only if in team"
  on "public"."teams"
  as permissive
  for update
  to public
using (((id = ( SELECT profiles.team_id
   FROM public.profiles
  WHERE (profiles.profile_id = ( SELECT auth.uid() AS uid)))) OR (( SELECT auth.uid() AS uid) = ( SELECT events.owner_id
   FROM public.events
  WHERE (events.event_id = teams.event_id)))))
with check (((id = ( SELECT profiles.team_id
   FROM public.profiles
  WHERE (profiles.profile_id = ( SELECT auth.uid() AS uid)))) OR (( SELECT auth.uid() AS uid) = ( SELECT events.owner_id
   FROM public.events
  WHERE (events.event_id = teams.event_id)))));


CREATE TRIGGER trg_check_team_size_before_join BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.check_team_size();


