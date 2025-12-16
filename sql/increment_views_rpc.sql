-- Create a function to increment the view count
-- This function uses SECURITY DEFINER to bypass RLS, allowing any authenticated user (or anon if granted) to increment the count
CREATE OR REPLACE FUNCTION increment_job_view(job_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE jobs
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = job_id;
END;
$$;
