ALTER TABLE "public"."event" RENAME TO "events";

ALTER TABLE "public"."events"
  ADD COLUMN IF NOT EXISTS event_type text;

ALTER TABLE "public"."events"
  ADD COLUMN IF NOT EXISTS is_private boolean NOT NULL DEFAULT false;

ALTER TABLE "public"."events"
  ADD COLUMN IF NOT EXISTS start_date date;

ALTER TABLE "public"."events"
  ADD COLUMN IF NOT EXISTS end_date date;

ALTER TABLE "public"."events"
  ADD COLUMN IF NOT EXISTS event_description text;

