alter table "public"."profiles" disable row level security;

alter table "public"."teams" disable row level security;

set check_function_bodies = off;

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


