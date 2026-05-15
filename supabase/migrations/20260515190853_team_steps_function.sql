set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_all_team_total_steps()
 RETURNS TABLE(team_id bigint, total_steps bigint)
 LANGUAGE sql
 STABLE
AS $function$
  select
    t.id as team_id,
    coalesce(sum(ds.dailysteps), 0)::bigint as total_steps
  from public.teams t
  left join public.profiles p
    on p.team_id = t.id
  left join public.daily_steps ds
    on ds.profile_id = p.profile_id
  group by t.id
  order by t.id;
$function$
;


