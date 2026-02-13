alter table "public"."daily_steps" disable row level security;

alter table "public"."profiles" disable row level security;

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
AS $function$BEGIN
    IF NEW.dailysteps < 0 OR NEW.dailysteps > 100000 THEN
        RAISE EXCEPTION 'Invalid step count: %', NEW.dailysteps;
    END IF;
    RETURN NEW;
END;$function$
;

CREATE TRIGGER objects_delete_delete_prefix AFTER DELETE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();

CREATE TRIGGER objects_insert_create_prefix BEFORE INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.objects_insert_prefix_trigger();

CREATE TRIGGER objects_update_create_prefix BEFORE UPDATE ON storage.objects FOR EACH ROW WHEN (((new.name <> old.name) OR (new.bucket_id <> old.bucket_id))) EXECUTE FUNCTION storage.objects_update_prefix_trigger();

CREATE TRIGGER prefixes_create_hierarchy BEFORE INSERT ON storage.prefixes FOR EACH ROW WHEN ((pg_trigger_depth() < 1)) EXECUTE FUNCTION storage.prefixes_insert_trigger();

CREATE TRIGGER prefixes_delete_hierarchy AFTER DELETE ON storage.prefixes FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


