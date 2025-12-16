-- sql/avatars-setup.sql
-- Run these statements in your Supabase SQL editor to create the `avatars` bucket
-- and add a conservative RLS policy that restricts uploads/updates to each user's
-- own folder (`<user_id>/...`).

-- 1) Create a private bucket called `avatars` (if it doesn't exist)
-- NOTE: The function will fail if the bucket already exists; that's safe to ignore.
-- 1) Create a public bucket called `uploadAvatarAction` (if it doesn't exist)
-- NOTE: The function will fail if the bucket already exists; that's safe to ignore.
select storage.create_bucket('uploadAvatarAction', { public := true });

-- 2) Row-level security policy for storage.objects to allow users to act only on
-- objects whose path begins with their `auth.uid()` + '/'.
-- This policy covers INSERT and UPDATE (and DELETE if you want to allow removals).

-- Enable RLS on storage.objects (should already be enabled in managed storage)
-- but include for clarity.
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY; -- storage.tables may already be managed by Supabase

-- Policy: allow authenticated users to insert/update/delete only objects whose
-- name starts with their user id (folder prefix). The `name` column contains
-- the object path inside the bucket (e.g. "<user_id>/filename.jpg").
create policy "uploadAvatarAction_user_policy" on storage.objects
  for all
  using (
    auth.uid() IS NOT NULL
    AND bucket_id = 'uploadAvatarAction'
    AND auth.uid() = split_part(name, '/', 1)
  )
  with check (
    auth.uid() IS NOT NULL
    AND bucket_id = 'uploadAvatarAction'
    AND auth.uid() = split_part(name, '/', 1)
  );

-- Notes:
-- - Run these in the Supabase SQL editor. Adjust names if your project uses a
--   different bucket name.
-- - This policy expects uploaded object names to begin with the user's id,
--   e.g. "<user_id>/avatar-123.jpg". The server action implemented in
--   `actions/profile-actions.ts` uploads to that exact pattern.
-- - For additional security, consider adding policies on `app_users` to
--   prevent users from updating other users' `avatar_url` via RLS or use
--   server-side updates only (as done by our server action which uses the
--   service role key).
