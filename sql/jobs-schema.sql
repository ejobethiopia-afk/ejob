-- sql/jobs-schema.sql
-- Minimal migration to create a `jobs` table expected by the application.
-- NOTE: This references `profiles(id)` since the runtime error indicated the FK points to `profiles`.
-- Review before applying to your database.

CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  company_name text,
  location text,
  salary text,
  salary_min integer DEFAULT 0,
  salary_max integer DEFAULT 0,
  category text,
  type text,
  description text,
  employer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jobs_employer_id ON jobs(employer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);

-- End of migration
