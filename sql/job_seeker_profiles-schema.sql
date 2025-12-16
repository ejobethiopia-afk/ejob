-- Migration: Align job_seeker_profiles with Job Seeker form
-- Drops redundant name columns and adds contact / link columns.
-- Run this in your Supabase SQL editor (make a backup before running in production).

BEGIN;

-- Remove duplicated name fields (names are stored in app_users.full_name)
ALTER TABLE IF EXISTS public.job_seeker_profiles
    DROP COLUMN IF EXISTS first_name,
    DROP COLUMN IF EXISTS last_name;

-- Add contact & link columns if they don't exist already
ALTER TABLE IF EXISTS public.job_seeker_profiles
    ADD COLUMN IF NOT EXISTS phone_number TEXT,
    ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
    ADD COLUMN IF NOT EXISTS github_url TEXT,
    ADD COLUMN IF NOT EXISTS portfolio_url TEXT;

-- Ensure education and experience are JSONB so they can store arrays of objects
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='job_seeker_profiles' AND column_name='education') THEN
        ALTER TABLE public.job_seeker_profiles ALTER COLUMN education TYPE jsonb USING (
            CASE WHEN jsonb_typeof(education::jsonb) IS NOT NULL THEN education::jsonb ELSE to_jsonb(education) END
        );
    ELSE
        ALTER TABLE public.job_seeker_profiles ADD COLUMN education jsonb;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='job_seeker_profiles' AND column_name='experience') THEN
        ALTER TABLE public.job_seeker_profiles ADD COLUMN experience jsonb;
    ELSE
        ALTER TABLE public.job_seeker_profiles ALTER COLUMN experience TYPE jsonb USING (
            CASE WHEN jsonb_typeof(experience::jsonb) IS NOT NULL THEN experience::jsonb ELSE to_jsonb(experience) END
        );
    END IF;
END
$$;

COMMIT;

-- Notes:
-- 1) This migration is non-destructive for new columns (safe). Dropping columns is destructive for the removed columns' data; ensure you have a backup if that data is needed.
-- 2) After running this, the server action `completeSeekerProfile` will upsert into these columns.
-- 3) Keep `app_users.full_name` as the canonical name source for all users.
