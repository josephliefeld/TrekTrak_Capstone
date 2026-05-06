-- ============================================
-- Restore private_event_members table
-- ============================================
create table if not exists "public"."private_event_members" (
  "id" uuid not null default gen_random_uuid(),
  "event_id" uuid,
  "email" text not null
);

CREATE UNIQUE INDEX IF NOT EXISTS private_event_members_pkey ON public.private_event_members USING btree (id);
CREATE UNIQUE INDEX IF NOT EXISTS unique_event_email ON public.private_event_members USING btree (event_id, email);

DO $$ BEGIN
  alter table "public"."private_event_members" add constraint "private_event_members_pkey" PRIMARY KEY using index "private_event_members_pkey";
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  alter table "public"."private_event_members" add constraint "private_event_members_event_id_fkey"
    FOREIGN KEY (event_id) REFERENCES public.events(event_id) ON DELETE CASCADE not valid;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

alter table "public"."private_event_members" validate constraint "private_event_members_event_id_fkey";

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

-- ============================================
-- Restore owner_id on events and teams
-- ============================================
alter table "public"."events" add column if not exists "owner_id" uuid not null;
alter table "public"."events" enable row level security;
alter table "public"."teams" add column if not exists "owner_id" uuid not null;

CREATE UNIQUE INDEX IF NOT EXISTS teams_owner_id_key ON public.teams USING btree (owner_id);

DO $$ BEGIN
  alter table "public"."events" add constraint "events_owner_id_fkey"
    FOREIGN KEY (owner_id) REFERENCES public.profiles(profile_id) not valid;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
alter table "public"."events" validate constraint "events_owner_id_fkey";

DO $$ BEGIN
  alter table "public"."teams" add constraint "teams_owner_id_fkey"
    FOREIGN KEY (owner_id) REFERENCES public.profiles(profile_id) not valid;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
alter table "public"."teams" validate constraint "teams_owner_id_fkey";

DO $$ BEGIN
  alter table "public"."teams" add constraint "teams_owner_id_key" UNIQUE using index "teams_owner_id_key";
EXCEPTION WHEN others THEN NULL; END $$;

-- ============================================
-- Restore functions
-- ============================================
set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.decrement_team_size()
 RETURNS trigger LANGUAGE plpgsql
AS $function$BEGIN
  IF OLD.team_id IS NOT NULL AND NEW.team_id IS NULL THEN
    UPDATE public.teams SET size = size - 1 WHERE id = OLD.team_id;
  END IF;
  RETURN NEW;
END;$function$;

CREATE OR REPLACE FUNCTION public.increment_team_size()
 RETURNS trigger LANGUAGE plpgsql
AS $function$BEGIN
  IF NEW.team_id IS DISTINCT FROM OLD.team_id AND NEW.team_id IS NOT NULL THEN
    UPDATE public.teams SET size = size + 1 WHERE id = NEW.team_id;
  END IF;
  RETURN NEW;
END;$function$;

CREATE OR REPLACE FUNCTION public.join_team_after_create()
 RETURNS trigger LANGUAGE plpgsql
AS $function$BEGIN
  UPDATE public.profiles SET team_id = NEW.id WHERE profile_id = NEW.owner_id;
  RETURN NEW;
END;$function$;

-- ============================================
-- Restore triggers
-- ============================================
DROP TRIGGER IF EXISTS trg_decrement_team_size_before_profile_teamid_update ON public.profiles;
CREATE TRIGGER trg_decrement_team_size_before_profile_teamid_update
  BEFORE UPDATE OF team_id ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.decrement_team_size();

DROP TRIGGER IF EXISTS trg_increment_team_size_after_profile_teamid_update ON public.profiles;
CREATE TRIGGER trg_increment_team_size_after_profile_teamid_update
  AFTER UPDATE OF team_id ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.increment_team_size();

DROP TRIGGER IF EXISTS trg_team_owner_join ON public.teams;
CREATE TRIGGER trg_team_owner_join
  AFTER INSERT ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.join_team_after_create();

-- ============================================
-- Restore RLS policies on events
-- ============================================
drop policy if exists "Delete for event owner only" on "public"."events";
create policy "Delete for event owner only"
  on "public"."events" as permissive for delete to authenticated
  using ((( SELECT auth.uid() AS uid) = owner_id));

drop policy if exists "Enable read access for all users" on "public"."events";
create policy "Enable read access for all users"
  on "public"."events" as permissive for select to authenticated, anon
  using (true);

drop policy if exists "Insert for Organizers only" on "public"."events";
create policy "Insert for Organizers only"
  on "public"."events" as permissive for insert to authenticated
  with check ((EXISTS ( SELECT 1
     FROM public.profiles
    WHERE ((profiles.profile_id = ( SELECT auth.uid() AS uid)) AND (profiles.role = 1)))));

drop policy if exists "Update for event owner only" on "public"."events";
create policy "Update for event owner only"
  on "public"."events" as permissive for update to authenticated
  using (( SELECT (( SELECT auth.uid() AS uid) = events.owner_id)));

-- ============================================
-- Restore RLS policies on teams
-- (old version first — 20260313184805 will drop and recreate it below)
-- ============================================
drop policy if exists "Enable delete for users based on owner_id" on "public"."teams";
create policy "Enable delete for users based on owner_id"
  on "public"."teams" as permissive for delete to authenticated
  using ((( SELECT auth.uid() AS uid) = owner_id));

drop policy if exists "Enable insert for authenticated users only" on "public"."teams";
create policy "Enable insert for authenticated users only"
  on "public"."teams" as permissive for insert to authenticated
  with check (true);

drop policy if exists "Enable read access for all users" on "public"."teams";
create policy "Enable read access for all users"
  on "public"."teams" as permissive for select to public
  using (true);

drop policy if exists "Update only if in team" on "public"."teams";
create policy "Update only if in team"
  on "public"."teams" as permissive for update to public
  using ((id = ( SELECT profiles.team_id
     FROM public.profiles
    WHERE (profiles.profile_id = ( SELECT auth.uid() AS uid)))))
  with check ((id = ( SELECT profiles.team_id
     FROM public.profiles
    WHERE (profiles.profile_id = ( SELECT auth.uid() AS uid)))));

-- ============================================
-- Restore storage policy
-- ============================================
drop policy if exists "Allow event tier icon upload 2ocsqq_0" on "storage"."objects";
drop policy if exists "Allow tier icon upload 2ocsqq_0" on "storage"."objects";

create policy "Allow tier icon upload 2ocsqq_0"
  on "storage"."objects" as permissive for insert to public
  with check ((bucket_id = 'event-tier-icons'::text));

-- ============================================
-- From 20260313190138
-- ============================================
alter table "public"."tiers" add column if not exists "icon_names" text[];

-- ============================================
alter table "public"."profiles" disable row level security;

-- ============================================
-- From 20260313184805
-- ============================================
create extension if not exists "hypopg" with schema "extensions";
create extension if not exists "index_advisor" with schema "extensions";

drop policy if exists "Update only if in team" on "public"."teams";

alter table "public"."tiers" drop constraint if exists "tiers_event_id_fkey";

create table if not exists "public"."max_size" (
  "max_team_size" bigint
);

alter table "public"."events" add column if not exists "allow_teams" boolean;
alter table "public"."events" add column if not exists "max_team_size" bigint;

DO $$ BEGIN
  alter table "public"."tiers" add constraint "tiers_event_id_fkey"
    FOREIGN KEY (event_id) REFERENCES public.events(event_id) ON DELETE CASCADE not valid;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

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
  IF NEW.team_id IS NULL THEN
    RETURN NEW;
  END IF;

  PERFORM 1
  FROM public.teams
  WHERE id = NEW.team_id
  FOR UPDATE;

  SELECT e.max_team_size
  INTO max_size
  FROM public.teams t
  JOIN public.events e ON e.event_id = t.event_id
  WHERE t.id = NEW.team_id;

  IF max_size IS NULL THEN
    RAISE EXCEPTION 'team % has no associated event or max_team_size is NULL', NEW.team_id;
  END IF;

  SELECT COUNT(*)
  INTO member_count
  FROM public.profiles
  WHERE team_id = NEW.team_id;

  IF TG_OP = 'INSERT' THEN
    member_count := member_count + 1;
  ELSIF TG_OP = 'UPDATE' THEN
    IF COALESCE(OLD.team_id::text, '') <> COALESCE(NEW.team_id::text, '') THEN
      member_count := member_count + 1;
    END IF;
  END IF;

  IF member_count > max_size THEN
    RAISE EXCEPTION 'team % is full (% > %)', NEW.team_id, member_count, max_size;
  END IF;

  RETURN NEW;
END;$function$;

CREATE OR REPLACE FUNCTION public.assign_tier_after_leaderboard_update()
 RETURNS trigger LANGUAGE plpgsql
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
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
AS $function$BEGIN
  INSERT INTO public.profiles (profile_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;$function$;

CREATE OR REPLACE FUNCTION public.update_leaderboard_after_daily_steps()
 RETURNS trigger LANGUAGE plpgsql
AS $function$
BEGIN
    INSERT INTO leaderboard (profile_id, total_steps, last_updated)
    VALUES (NEW.profile_id, NEW.steps, NOW())
    ON CONFLICT (profile_id) DO UPDATE
        SET total_steps = leaderboard.total_steps + EXCLUDED.total_steps,
            last_updated = NOW();
    RETURN NEW;
END;
$function$;

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
  on "public"."teams" as permissive for update to public
  using (((id = ( SELECT profiles.team_id
    FROM profiles
    WHERE (profiles.profile_id = ( SELECT auth.uid() AS uid)))) OR (( SELECT auth.uid() AS uid) = ( SELECT events.owner_id
    FROM events
    WHERE (events.event_id = teams.event_id))) OR (( SELECT auth.uid() AS uid) = owner_id)))
  with check (  ((id = ( SELECT profiles.team_id
   FROM profiles
    WHERE (profiles.profile_id = ( SELECT auth.uid() AS uid)))) OR (( SELECT auth.uid() AS uid) = ( SELECT events.owner_id
   FROM events
    WHERE (events.event_id = teams.event_id))) OR (( SELECT auth.uid() AS uid) = owner_id)));

DROP TRIGGER IF EXISTS trg_check_team_size_before_join ON public.profiles;
CREATE TRIGGER trg_check_team_size_before_join
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.check_team_size();