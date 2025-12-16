"use server";

import { createActionClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Centralize bucket name used for uploads
const STORAGE_BUCKET = "uploadAvatarAction";

export async function uploadAvatarAction(formData: FormData) {
  const supabase = await createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Must be logged in to upload an avatar");
  }

  const file = formData.get("avatar") as File | null;
  if (!file) {
    return { error: "No file provided" };
  }

  // Basic validation
  if (!file.type.startsWith("image/")) {
    return { error: "Only image files are allowed" };
  }

  const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
  if (file.size > MAX_BYTES) {
    return { error: "File too large (max 5MB)" };
  }

  // Use admin client for storage upload and DB update (bypass RLS safely on server)
  const adminClient = createAdminClient();

  // Build a safe filename to avoid collisions
  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const path = `${user.id}/${filename}`; // stored inside bucket under user id folder

  // Upload to the `uploadAvatarAction` bucket (must exist and be public)
  const BUCKET = "uploadAvatarAction";

  const { error: uploadError } = await adminClient.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true });

  if (uploadError) {
    console.error("Avatar upload error:", uploadError);
    const msg = uploadError?.message || "Failed to upload avatar";

    // FIX: Cast to any to bypass TypeScript status error
    const err = uploadError as any;
    if (err.status === 404 || err.statusCode === '404' || /bucket not found/i.test(msg)) {
      return { error: `Bucket '${BUCKET}' not found. Run sql/avatars-setup.sql in your Supabase project to create the bucket named '${BUCKET}'.` };
    }
    return { error: msg };
  }

  const { data: publicData } = adminClient.storage
    .from(BUCKET)
    .getPublicUrl(path);

  if (!publicData?.publicUrl) {
    return { error: "Failed to create public URL" };
  }

  const publicUrl = publicData.publicUrl;

  const { error: dbError } = await adminClient
    .from("app_users")
    .update({ avatar_url: publicUrl })
    .eq("id", user.id);

  if (dbError) {
    console.error("Failed to update app_users avatar_url:", dbError);
    try {
      if (/column\s+"avatar_url"\s+does not exist/i.test(dbError.message || "")) {
        const { error: fallbackError } = await adminClient
          .from("app_users")
          .update({ avater_url: publicUrl } as any) // Cast to any in case column is misspelled in DB
          .eq("id", user.id);
        if (!fallbackError) {
          console.warn("Fallback: updated avater_url column instead of avatar_url");
        } else {
          console.error("Fallback update to avater_url also failed:", fallbackError);
          return { error: fallbackError.message || "Failed to update user avatar" };
        }
      } else {
        return { error: dbError.message || "Failed to update user avatar" };
      }
    } catch (e: any) {
      console.error("Unexpected error during fallback avatar update:", e);
      return { error: e?.message || "Failed to update user avatar" };
    }
  }

  revalidatePath("/");
  return { success: true, url: publicUrl };
}

export async function uploadCompanyLogoAction(formData: FormData) {
  const supabase = await createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Must be logged in to upload a company logo");
  }

  const file = formData.get("company_logo") as File | null;
  if (!file) {
    return { error: "No file provided" };
  }

  if (!file.type.startsWith("image/")) {
    return { error: "Only image files are allowed" };
  }

  const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
  if (file.size > MAX_BYTES) {
    return { error: "File too large (max 5MB)" };
  }

  const adminClient = createAdminClient();

  const ext = file.name.split(".").pop() ?? "png";
  const filename = `company-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const path = `${user.id}/${filename}`;

  const { error: uploadError } = await adminClient.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, { upsert: true });

  if (uploadError) {
    console.error("Company logo upload error:", uploadError);
    const msg = uploadError?.message || "Failed to upload company logo";

    // FIX: Cast to any to bypass TypeScript status error
    const err = uploadError as any;
    if (err.status === 404 || err.statusCode === '404' || /bucket not found/i.test(msg)) {
      return { error: `Bucket '${STORAGE_BUCKET}' not found. Run sql/avatars-setup.sql in your Supabase project to create the bucket named '${STORAGE_BUCKET}'.` };
    }
    return { error: msg };
  }

  const { data: publicData } = adminClient.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(path);

  if (!publicData?.publicUrl) {
    return { error: "Failed to create public URL" };
  }

  const publicUrl = publicData.publicUrl;

  const { error: dbError } = await adminClient
    .from("employer_profiles")
    .upsert({ user_id: user.id, company_logo: publicUrl }, { onConflict: "user_id" });

  if (dbError) {
    console.error("Failed to upsert employer_profiles company_logo:", dbError);
    try {
      if (/column\s+"company_logo"\s+does not exist/i.test(dbError.message || "")) {
        const { error: fallbackError } = await adminClient
          .from("app_users")
          .update({ company_logo: publicUrl } as any)
          .eq("id", user.id);
        if (!fallbackError) {
          console.warn("Fallback: updated app_users.company_logo instead of employer_profiles.company_logo");
        } else {
          console.error("Fallback update for company logo also failed:", fallbackError);
          return { error: fallbackError.message || "Failed to save company logo" };
        }
      } else {
        return { error: dbError.message || "Failed to save company logo" };
      }
    } catch (e: any) {
      console.error("Unexpected error during fallback company logo update:", e);
      return { error: e?.message || "Failed to save company logo" };
    }
  }

  revalidatePath("/");
  return { success: true, url: publicUrl };
}