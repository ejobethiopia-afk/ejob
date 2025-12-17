// auth-actions.ts
"use server";

import { createActionClient, createAdminClient, createClient } from "@/lib/supabase/server";
import { UserRole } from "@/types";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from 'next/navigation'; // <-- The necessary import

export async function signInAction(formData: FormData) {
    const credential = formData.get("credential") as string; // Can be email or username
    const password = formData.get("password") as string;

    if (!credential || !password) {
        return { error: "Credential and password are required" };
    }

    const supabase = await createActionClient();

    // 1. Credential Check: Determine if input is email or username
    const isEmail = credential.includes('@');
    let emailToUse = credential;

    console.log('Login attempt:', { credential, isEmail });

    // 2. Username Lookup: If username, get the associated email
    if (!isEmail) {
        console.log('Looking up username:', credential);

        // Use admin client to bypass RLS for username lookup
        const adminClient = createAdminClient();
        const { data: appUser, error: lookupError } = await adminClient
            .from('app_users')
            .select('email')
            .eq('username', credential)
            .single();

        if (lookupError || !appUser) {
            console.error("Username lookup error:", lookupError);
            console.log('Username not found:', credential);
            return { error: "Invalid username or password" };
        }

        console.log('Username found, using email:', appUser.email);
        emailToUse = appUser.email;
    } else {
        console.log('Using email directly:', credential);
    }

    // 3. Supabase Sign-In: Use the resolved email
    const { error: signInError } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password: password,
    });

    if (signInError) {
        console.error("Sign-in error:", signInError.message);
        return { error: "Invalid email/username or password" };
    }

    // Revalidate the main path to refresh server components
    revalidatePath('/');

    // Return success - client will handle refresh and navigation
    return { success: true };
}

export async function signUpAction(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as UserRole;
    const username = formData.get("username") as string;
    const fullName = formData.get("full_name") as string;
    const captchaToken = formData.get("captchaToken") as string;

    // CAPTCHA Verification
    if (!captchaToken) {
        return { error: "CAPTCHA verification is required" };
    }

    // Verify CAPTCHA with Google
    const { verifyCaptcha } = await import("@/actions/captcha-actions");
    const captchaResult = await verifyCaptcha(captchaToken);

    if (!captchaResult.success) {
        return { error: captchaResult.error || "CAPTCHA verification failed" };
    }

    // Validation
    if (!role) {
        return { error: "Please select a role" };
    }

    if (!username || username.length < 3 || username.length > 20) {
        return { error: "Username must be between 3 and 20 characters" };
    }

    // Server-side validation: Check for spaces in username
    if (username.includes(' ')) {
        return { error: "Username cannot contain spaces" };
    }

    // Additional validation: Only allow alphanumeric and underscores
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
        return { error: "Username can only contain letters, numbers, and underscores" };
    }

    if (!fullName || fullName.trim().length === 0) {
        return { error: "Full name is required" };
    }

    if (!email || !password) {
        return { error: "Email and password are required" };
    }

    const supabase = await createActionClient();

    // 1. Auth Creation: Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (authError) {
        console.error("Auth signup error:", authError.message);
        return { error: authError.message };
    }

    if (!authData.user) {
        console.error("Auth signup succeeded but no user object returned");
        return { error: "Something went wrong during sign up" };
    }

    // Secure Identity Extraction: Explicitly check user ID is not null
    const userId = authData.user.id;
    if (!userId) {
        console.error("CRITICAL: Auth user ID is null or undefined");
        return { error: "Failed to retrieve user ID from authentication" };
    }

    console.log("✅ Auth signup successful - User ID:", userId);

    // 2. Role and Username Insertion: Use admin client for guaranteed insert
    try {
        const adminClient = createAdminClient();

        // Payload Check: Strict validation of all required fields
        const insertPayload = {
            id: userId,
            email: email,
            username: username,
            full_name: fullName,
            role: role,
            avatar_url: null,
        };

        // Debug: Log the exact payload being inserted
        console.log("📦 INSERT payload for app_users:", JSON.stringify(insertPayload, null, 2));

        // Validate all required fields are present
        if (!insertPayload.id) {
            console.error("❌ VALIDATION FAILED: id is missing");
            return { error: "Internal error: User ID missing" };
        }
        if (!insertPayload.email) {
            console.error("❌ VALIDATION FAILED: email is missing");
            return { error: "Internal error: Email missing" };
        }
        if (!insertPayload.username) {
            console.error("❌ VALIDATION FAILED: username is missing");
            return { error: "Internal error: Username missing" };
        }
        if (!insertPayload.full_name) {
            console.error("❌ VALIDATION FAILED: full_name is missing");
            return { error: "Internal error: Full name missing" };
        }
        if (!insertPayload.role) {
            console.error("❌ VALIDATION FAILED: role is missing");
            return { error: "Internal error: Role missing" };
        }

        console.log("✅ All required fields validated - proceeding with INSERT");

        const { error: dbError } = await adminClient
            .from("app_users")
            .insert(insertPayload);

        if (dbError) {
            // Debugging Output: Print exact database error
            console.error("❌ DATABASE ERROR during app_users INSERT:");
            console.error("Error Message:", dbError.message);
            console.error("Error Details:", dbError.details);
            console.error("Error Hint:", dbError.hint);
            console.error("Error Code:", dbError.code);
            console.error("Full Error Object:", JSON.stringify(dbError, null, 2));

            // Parse duplicate key errors for user-friendly messages
            if (dbError.code === '23505') { // Unique constraint violation
                if (dbError.message.includes('app_users_username_key')) {
                    return { error: "This username is already taken. Please choose a different username." };
                } else if (dbError.message.includes('app_users_email_key')) {
                    return { error: "This email is already registered. Please use a different email or try logging in." };
                }
                // Generic duplicate error if we can't determine the field
                return { error: "This account information is already in use. Please try different credentials." };
            }

            // Parse foreign key constraint errors
            if (dbError.code === '23503') { // Foreign key violation
                if (dbError.message.includes('app_users_id_fkey')) {
                    // This means the auth user wasn't created properly
                    // This could happen if the email is already registered in auth.users
                    return { error: "This email is already registered. Please try logging in instead." };
                }
            }

            // Return generic error for other database issues
            return { error: `Database error: ${dbError.message}` };
        }

        console.log("✅ Successfully created app_user record for:", userId);

    } catch (error) {
        console.error("❌ EXCEPTION during app_users insert:");
        console.error("Exception:", error);
        console.error("Exception type:", typeof error);
        console.error("Exception stack:", error instanceof Error ? error.stack : "No stack trace");

        return { error: "An unexpected error occurred during profile creation" };
    }


    // 3. Success Redirection: Redirect to success page
    // Onboarding will be handled by middleware after email confirmation
    console.log("✅ Dual-write complete - redirecting to success page");
    redirect("/sign-up-success");
}

export async function completeSeekerProfile(formData: FormData) {
    const supabase = await createActionClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Must be logged in");
    }

    // New/updated profile fields
    const bio = formData.get("bio") as string;
    const location = formData.get("location") as string;
    const resumeUrl = formData.get("resume_url") as string;
    const educationRaw = formData.get("education") as string;
    const skills = formData.get("skills") as string;
    const experienceRaw = formData.get("experience") as string;
    const phoneNumber = formData.get("phone_number") as string;
    const linkedinUrl = formData.get("linkedin_url") as string;
    const githubUrl = formData.get("github_url") as string;
    const portfolioUrl = formData.get("portfolio_url") as string;

    // Parse JSONB fields (education, experience) if provided
    let educationParsed = null;
    if (educationRaw) {
        try {
            educationParsed = JSON.parse(educationRaw);
        } catch (e) {
            // If it's not valid JSON, ignore and leave null
            console.debug("Failed to parse education JSON", e);
        }
    }

    // Normalize education entries: if user selected the placeholder 'Other (Institution Not Listed)'
    // and provided a manual institution name in `institution_manual`, prefer that value.
    const OTHER_PLACEHOLDER = "Other (Institution Not Listed)";
    if (Array.isArray(educationParsed)) {
        educationParsed = educationParsed.map((ent: any) => {
            try {
                const inst = ent?.institution;
                const manual = ent?.institution_manual;
                if (inst === OTHER_PLACEHOLDER && manual && typeof manual === 'string' && manual.trim().length > 0) {
                    return { ...ent, institution: manual };
                }
            } catch (e) {
                // ignore malformed entry
            }
            return ent;
        });
    }

    // Handle field_of_study 'Other' override (program manual entry)
    const PROGRAM_OTHER = "Other (Program Not Listed)";
    if (Array.isArray(educationParsed)) {
        educationParsed = educationParsed.map((ent: any) => {
            try {
                const field = ent?.field_of_study;
                const manualField = ent?.field_of_study_manual;
                if (field === PROGRAM_OTHER && manualField && typeof manualField === 'string' && manualField.trim().length > 0) {
                    return { ...ent, field_of_study: manualField };
                }
            } catch (e) {
                // ignore malformed entry
            }
            return ent;
        });
    }

    let experienceParsed = null;
    if (experienceRaw) {
        try {
            experienceParsed = JSON.parse(experienceRaw);
        } catch (e) {
            console.debug("Failed to parse experience JSON", e);
        }
    }

    // Parse skills string into an array to match the DB text[] column
    let skillsParsed: string[] | null = null;
    if (skills && typeof skills === 'string') {
        const parts = skills.split(',').map(s => s.trim()).filter(Boolean);
        skillsParsed = parts.length > 0 ? parts : null;
    }

    // Use upsert to handle both insert and update; names are intentionally omitted
    const { error } = await supabase.from("job_seeker_profiles").upsert({
        user_id: user.id,
        bio: bio || null,
        location: location || null,
        resume_url: resumeUrl || null,
        education: educationParsed || null,
        experience: experienceParsed || null,
        skills: skillsParsed || null,
        phone_number: phoneNumber || null,
        linkedin_url: linkedinUrl || null,
        github_url: githubUrl || null,
        portfolio_url: portfolioUrl || null,
    }, {
        onConflict: 'user_id'
    });

    if (error) {
        console.error("Error saving seeker profile:", error);
        return { error: "Failed to save profile" };
    }

    // Don't redirect, just return success
    return { success: true };
}

export async function completeEmployerProfile(formData: FormData) {
    const supabase = await createActionClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Must be logged in");
    }

    const companyName = formData.get("company_name") as string;
    const companyLogo = formData.get("company_logo") as string;
    const companyWebsite = formData.get("company_website") as string;
    const companyDescription = formData.get("company_description") as string;
    const location = formData.get("location") as string;

    // Validate required fields
    if (!companyName) {
        return { error: "Company name is required" };
    }

    // Use upsert to handle both insert and update
    const { error } = await supabase.from("employer_profiles").upsert({
        user_id: user.id,
        company_name: companyName,
        company_logo: companyLogo || null,
        company_website: companyWebsite || null,
        company_description: companyDescription || null,
        location: location || null,
    }, {
        onConflict: 'user_id'
    });

    if (error) {
        console.error("Error saving employer profile:", error);
        return { error: "Failed to save profile" };
    }

    // Don't redirect, just return success
    return { success: true };
}

export async function updatePasswordAction(formData: FormData) {
    const supabase = await createActionClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Must be logged in");
    }

    const currentPassword = formData.get("current_password") as string;
    const newPassword = formData.get("new_password") as string;
    const confirmPassword = formData.get("confirm_password") as string;

    if (!newPassword || !confirmPassword) {
        return { error: "Please provide and confirm the new password" };
    }

    if (newPassword !== confirmPassword) {
        return { error: "New password and confirmation do not match" };
    }

    if (newPassword.length < 8) {
        return { error: "Password must be at least 8 characters" };
    }

    // If user provided their current password, try to reauthenticate first.
    // This allows us to detect an incorrect current password before attempting update.
    if (currentPassword && user.email) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: currentPassword,
        });

        if (signInError) {
            return { error: "Current password is incorrect" };
        }
    }

    // Attempt to update the user's password. Supabase may require a recent login.
    try {
        const { data, error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
            // If session is too old, suggest password reset via email
            const needsRecentLogin = /recent|session|authenticate|re-auth/i.test(error.message || "");
            return { error: error.message || "Failed to update password", needsRecentLogin };
        }

        return { success: true };
    } catch (e: any) {
        const msg = e?.message || String(e);
        const needsRecentLogin = /recent|session|authenticate|re-auth/i.test(msg);
        return { error: msg, needsRecentLogin };
    }
}

export async function logoutUser() {
    try {
        const supabase = await createActionClient();
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('Logout error:', error);
            throw new Error('Failed to sign out. Please try again.');
        }

        // Clear any relevant caches or perform other cleanup
        revalidatePath('/');

        // Return a response that the client can handle
        return { success: true };
    } catch (error) {
        console.error('Logout error:', error);
        throw new Error('Failed to sign out. Please try again.');
    }
}
