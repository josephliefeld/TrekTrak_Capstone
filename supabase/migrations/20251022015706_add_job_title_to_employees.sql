-- Add a new job_title column
ALTER TABLE "public"."employees"
ADD COLUMN "job_title" text;

-- Backfill existing employees with a placeholder title
UPDATE "public"."employees"
SET "job_title" = 'Unassigned'
WHERE "job_title" IS NULL;

-- Set a default for future inserts
ALTER TABLE "public"."employees"
ALTER COLUMN "job_title" SET DEFAULT 'Unassigned';
