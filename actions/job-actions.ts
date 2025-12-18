"use server";

import { createActionClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { isUUID } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { redirect } from 'next/navigation';

// Define the maximum CV size constant
const MAX_CV_SIZE = 5 * 1024 * 1024; // 5MB

// Helper function to extract error message from unknown type
function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    // Handle the case where the error is an object with a message property (common for Supabase)
    if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as { message: unknown }).message === 'string') {
        return (error as { message: string }).message;
    }
    return 'An unknown error occurred';
}

/**
 * Toggles the save status of a job for the current user.
 * @param jobId The ID of the job to save or unsave.
 */
export async function toggleSaveJob(jobId: string) {
    const supabase = await createActionClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Must be logged in to save jobs" };
    }

    try {
        // 1. Verify the user exists in app_users and get their role
        const { data: userData, error: userError } = await supabase
            .from('app_users')
            .select('id, role')
            .eq('id', user.id)
            .single();

        if (userError || !userData) {
            return {
                success: false,
                error: "User account not properly set up. Please complete your profile."
            };
        }

        // 2. Allow job seekers and employers to save jobs
        if (userData.role !== 'job_seeker' && userData.role !== 'employer') {
            return {
                success: false,
                error: "Only job seekers and employers can save jobs."
            };
        }

        // Check if already saved
        const { data: existing, error: fetchError } = await supabase
            .from('saved_jobs')
            .select('id')
            .eq('user_id', user.id)
            .eq('job_id', jobId)
            .maybeSingle();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is 'no rows returned'
            throw fetchError;
        }

        if (existing) {
            // Delete
            const { error: deleteError } = await supabase
                .from('saved_jobs')
                .delete()
                .eq('id', existing.id);

            if (deleteError) throw deleteError;

            revalidatePath(`/jobs/${jobId}`);
            revalidatePath('/saved-jobs');
            revalidatePath('/dashboard/saved');
            return { success: true, action: 'removed' };
        } else {
            // Insert
            const { error: insertError } = await supabase
                .from('saved_jobs')
                .insert({
                    user_id: user.id,
                    job_id: jobId
                });

            if (insertError) {
                if (insertError.code === '23503') { // Foreign key violation
                    return {
                        success: false,
                        error: "Could not save job. The job may no longer exist."
                    };
                }
                throw insertError;
            }

            revalidatePath(`/jobs/${jobId}`);
            revalidatePath('/saved-jobs');
            revalidatePath('/dashboard/saved');
            return { success: true, action: 'saved' };
        }
    } catch (error: unknown) {
        console.error('Error in toggleSaveJob:', error);
        return {
            success: false,
            error: getErrorMessage(error)
        };
    }
}

/**
 * Gets the saved status of a job for the current user.
 * @param jobId The ID of the job to check.
 */
export async function getSavedStatus(jobId: string) {
    const supabase = await createActionClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    const { data } = await supabase
        .from('saved_jobs')
        .select('id')
        .eq('user_id', user.id)
        .eq('job_id', jobId)
        .single();

    return !!data;
}

/**
 * Submits a basic application without a CV or Cover Letter.
 * @param jobId The ID of the job to apply for.
 */
export async function submitApplication(jobId: string) {
    const supabase = await createActionClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, message: "Must be logged in to apply" };
    }

    if (!isUUID(jobId)) {
        return { success: false, message: `Invalid job ID format. Expected UUID, received: ${jobId}.` };
    }

    try {
        // 1. Get job details including employer_id
        const { data: jobData, error: jobError } = await supabase
            .from('jobs')
            .select('title, employer_id')
            .eq('id', jobId)
            .single();

        if (jobError || !jobData) {
            throw new Error(jobError?.message || 'Job not found');
        }

        // 2. Check user role
        const { data: appUser, error: roleError } = await supabase
            .from('app_users')
            .select('role, full_name, email')
            .eq('id', user.id)
            .single();

        if (roleError || !appUser) {
            throw new Error('Unable to verify user role. Please try again.');
        }

        if (appUser.role !== 'job_seeker') {
            return {
                success: false,
                message: `Your account has a ${appUser.role} role. Only job seekers can apply for jobs.`
            };
        }

        // 3. Check for duplicate application
        const { data: existing } = await supabase
            .from('applications')
            .select('id')
            .eq('applicant_id', user.id)
            .eq('job_id', jobId)
            .maybeSingle();

        if (existing) {
            return { success: false, message: "You have already applied for this job." };
        }

        // 4. Insert application into database
        const { error: insertError, data: application } = await supabase
            .from('applications')
            .insert([{
                applicant_id: user.id,
                job_id: jobId,
                status: 'New',
                // cv_url and cover_letter_content are null by default
            }])
            .select()
            .single();

        if (insertError || !application) {
            console.error('Database error:', insertError);
            throw new Error(insertError?.message || 'Failed to submit application');
        }

        // 5. Create notification for employer
        if (jobData.employer_id) {
            const notificationMessage = `New application from ${appUser.full_name || 'a candidate'} for "${jobData.title}"`;

            const { error: notifError } = await supabase
                .from('notifications')
                .insert({
                    user_id: jobData.employer_id, // The UUID of the employer
                    message: notificationMessage,
                    link_url: `/dashboard/applications/${application.id}`,
                    is_read: false,
                });

            if (notifError) {
                console.error('Failed to create notification:', notifError);
            }
        }

        // 6. Revalidate relevant paths
        revalidatePath(`/jobs/${jobId}`);
        revalidatePath('/dashboard/applications');

        return {
            success: true,
            message: "Application submitted successfully!",
            applicationId: application.id
        };

    } catch (error: unknown) {
        console.error("Application Error:", error);
        return {
            success: false,
            message: getErrorMessage(error)
        };
    }
}

/**
 * Uploads a CV file to Supabase Storage.
 * @param file The file object.
 * @param userId The ID of the user (for path organization).
 * @returns The public URL of the uploaded file.
 */
export async function uploadCVFile(file: File, userId: string): Promise<string> {
    const supabase = await createActionClient();

    if (!file) throw new Error('No file provided');
    if (file.size > MAX_CV_SIZE) throw new Error('CV file exceeds maximum allowed size of 5MB');

    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `resumes/${userId}/${timestamp}-${safeName}`;

    // Convert File to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(path, buffer, {
            contentType: file.type,
            upsert: false,
            cacheControl: '3600'
        });

    if (uploadError) {
        console.error('CV upload error:', uploadError);
        throw new Error('Failed to upload CV: ' + uploadError.message);
    }

    const { data: publicData } = await supabase.storage.from('resumes').getPublicUrl(path);
    return publicData?.publicUrl || '';
}

/**
 * Enhanced application submission using FormData for CV and Cover Letter.
 * @param prevState The previous state from useFormState (unused here but required by signature).
 * @param formData The form data containing jobId, cv, and cover_letter_content.
 */
export async function submitApplicationWithForm(prevState: any, formData: FormData) {
    const jobId = formData.get('jobId') as string;
    const supabase = await createActionClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, message: "Must be logged in to apply for jobs" };
    }

    try {
        // 1. Fetch ALL needed user details (role, name, email) for check AND notification
        const { data: appUser, error: roleError } = await supabase
            .from('app_users')
            .select('role, full_name, email')
            .eq('id', user.id)
            .single();

        if (roleError || !appUser) {
            return { success: false, message: 'Unable to verify user role. Please try again.' };
        }

        // Only job seekers can apply for jobs
        if (appUser.role !== 'job_seeker') {
            return {
                success: false,
                message: `Your account has a ${appUser.role} role. Only job seekers can apply for jobs.`
            };
        }

        // 2. Check for duplicate application
        const { data: existing } = await supabase
            .from('applications')
            .select('id')
            .eq('applicant_id', user.id)
            .eq('job_id', jobId)
            .maybeSingle();

        if (existing) {
            return { success: false, message: 'You have already applied for this job.' };
        }

        // 3. Handle file upload and cover letter
        let cvUrl: string | null = null;
        let coverLetter: string | null = null;

        const cvFile = formData.get('cv') as File | null;
        coverLetter = formData.get('cover_letter_content') as string || null;

        if (!jobId) {
            throw new Error('Job ID is required');
        }

        if (cvFile && cvFile.size > 0) {
            if (cvFile.size > MAX_CV_SIZE) {
                throw new Error('CV file exceeds maximum allowed size of 5MB');
            }
            cvUrl = await uploadCVFile(cvFile, user.id);
        }

        // 4. Insert application into database
        const { error, data: application } = await supabase
            .from('applications')
            .insert([{
                applicant_id: user.id, // Must match RLS policy check
                job_id: jobId,
                cv_url: cvUrl,
                cover_letter_content: coverLetter,
                status: 'New', // Or 'pending' as defined in your schema
            }])
            .select()
            .single();

        // 🛑 CRITICAL FIX: Ensure the application object and its ID exist
        if (error || !application || !application.id) {
            console.error('Database error:', error);
            throw new Error('Failed to save application to database or missing application ID.');
        }

        // 5. Fetch Job Data (including employer_id and title) for notification
        const { data: jobData, error: jobError } = await supabase
            .from('jobs')
            .select('title, employer_id')
            .eq('id', jobId)
            .single();

        if (jobError) {
            console.error('CRITICAL: Failed to fetch job data for notification:', jobError);
        }

        // 6. Create notification for employer
        if (jobData?.employer_id) {

            const applicantName = appUser?.full_name || 'A candidate';
            const jobTitle = jobData.title || 'a job';

            const notificationMessage = `New application from ${applicantName} for "${jobTitle}"`;

            const { error: notifError } = await supabase
                .from('notifications')
                .insert({
                    user_id: jobData.employer_id, // This is the UUID of the employer
                    message: notificationMessage,
                    link_url: `/dashboard/applications/${application.id}`,
                    is_read: false,
                });

            if (notifError) {
                console.error('CRITICAL: Failed to create notification (DB INSERT error):', notifError);
            }
        } else {
            console.warn(`WARN: Notification skipped. Job Data (ID: ${jobId}) was missing or employer_id was null.`);
        }

        // 7. Revalidate relevant paths
        revalidatePath(`/jobs/${jobId}`);
        revalidatePath('/dashboard/applications');

        // 8. Success return
        return {
            success: true,
            message: 'Application submitted successfully!'
        };

    } catch (error: unknown) {
        console.error('Error in submitApplicationWithForm:', error);
        return {
            success: false,
            message: getErrorMessage(error)
        };
    }
}

/**
 * Handles the submission and creation of a new job listing.
 * @param formData The form data for the job post.
 */
export async function postJobListing(formData: FormData) {
    const supabase = await createActionClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        redirect('/login');
    }

    // Verify CAPTCHA first
    const captchaToken = formData.get("captchaToken") as string;
    if (!captchaToken) {
        throw new Error("CAPTCHA verification is required");
    }

    const { verifyCaptcha } = await import("@/actions/captcha-actions");
    const captchaResult = await verifyCaptcha(captchaToken);

    if (!captchaResult.success) {
        throw new Error(captchaResult.error || "CAPTCHA verification failed");
    }

    // Ensure employer role - CRITICAL SECURITY CHECK
    const { data: appUser, error: roleError } = await supabase
        .from('app_users')
        .select('role')
        .eq('id', user.id)
        .single();

    if (roleError || !appUser || appUser.role !== 'employer') {
        throw new Error('Unauthorized: Only employers can post jobs');
    }


    const title = String(formData.get('title') ?? '').trim();
    const company_name = String(formData.get('company_name') ?? '').trim();
    const location = String(formData.get('location') ?? '').trim();
    const salary = String(formData.get('salary') ?? '').trim();
    const salary_min = parseInt(String(formData.get('salary_min') ?? '0'), 10) || 0;
    const salary_max = parseInt(String(formData.get('salary_max') ?? '0'), 10) || 0;
    const category = String(formData.get('category') ?? '').trim();
    const type = String(formData.get('type') ?? 'Full-time').trim();
    const description = String(formData.get('description') ?? '').trim();

    // New Fields
    const experience_level = String(formData.get('experience_level') ?? '').trim();
    const required_skills = String(formData.get('required_skills') ?? '').trim();
    const application_deadline = String(formData.get('application_deadline') ?? '').trim();

    if (!title || !description || !company_name || !category) {
        throw new Error('Title, Company Name, Category, and Description are required.');
    }

    // Verify employer profile exists
    const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle();
    if (!profile) {
        throw new Error('Employer profile not found. Please complete your employer profile before posting a job.');
    }

    const newJob = {
        id: uuidv4(),
        title,
        company_name,
        location,
        salary,
        salary_min,
        salary_max,
        category,
        type,
        description,
        employer_id: user.id,
        experience_level: experience_level || null,
        required_skills: required_skills || null,
        application_deadline: application_deadline || null,
        created_at: new Date().toISOString(),
        views_count: 0
    };

    const { data: inserted, error: dbError } = await supabase.from('jobs').insert([newJob]).select('id').single();
    if (dbError) {
        console.error('Failed to insert job:', dbError);
        throw new Error(dbError.message || 'Failed to create job');
    }

    const newJobId = inserted?.id;
    if (!newJobId) {
        redirect('/dashboard');
    }

    revalidatePath(`/jobs/${newJobId}`);
    redirect(`/jobs/${newJobId}`);
}

/**
 * Increment the view count for a job.
 * @param jobId The ID of the job to increment view for.
 */
export async function incrementJobView(jobId: string) {
    const supabase = await createActionClient();

    try {
        const { error: rpcError } = await supabase.rpc('increment_job_views', { job_id: jobId });

        if (rpcError) {
            console.error('RPC failed, falling back to standard update (may fail due to RLS):', rpcError);

            // Fallback (will likely fail if RLS is strict)
            const { data: job, error: fetchError } = await supabase
                .from('jobs')
                .select('views_count')
                .eq('id', jobId)
                .single();

            if (fetchError || !job) return;

            await supabase
                .from('jobs')
                .update({ views_count: (job.views_count || 0) + 1 })
                .eq('id', jobId);
        }

        revalidatePath('/');
        revalidatePath(`/jobs/${jobId}`);

    } catch (e) {
        console.error('Failed to increment view', e);
    }
}

/**
 * Updates an existing job listing.
 * @param formData The form data containing job details.
 */
export async function updateJob(formData: FormData) {
    const supabase = await createActionClient();

    // 1. Authenticate
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/login');
    }

    // 1.5 Verify employer role - CRITICAL SECURITY CHECK
    const { data: appUser, error: roleError } = await supabase
        .from('app_users')
        .select('role')
        .eq('id', user.id)
        .single();

    if (roleError || !appUser || appUser.role !== 'employer') {
        throw new Error('Unauthorized: Only employers can update jobs');
    }

    // 2. Extract Data
    const jobId = formData.get('jobId') as string;
    if (!jobId || !isUUID(jobId)) {
        throw new Error('Invalid Job ID');
    }

    const title = String(formData.get('title') ?? '').trim();
    const company_name = String(formData.get('company_name') ?? '').trim();
    const location = String(formData.get('location') ?? '').trim();
    const salary = String(formData.get('salary') ?? '').trim();
    const salary_min = parseInt(String(formData.get('salary_min') ?? '0'), 10) || 0;
    const salary_max = parseInt(String(formData.get('salary_max') ?? '0'), 10) || 0;
    const category = String(formData.get('category') ?? '').trim();
    const type = String(formData.get('type') ?? 'Full-time').trim();
    const description = String(formData.get('description') ?? '').trim();
    const experience_level = String(formData.get('experience_level') ?? '').trim();
    const required_skills = String(formData.get('required_skills') ?? '').trim();
    const application_deadline = String(formData.get('application_deadline') ?? '').trim();

    if (!title || !description || !company_name || !category) {
        throw new Error('Title, Company Name, Category, and Description are required.');
    }

    // 3. Verify Ownership (and implicitly role)
    // We check if a job exists with this ID AND this employer_id
    const { data: existingJob, error: checkError } = await supabase
        .from('jobs')
        .select('id')
        .eq('id', jobId)
        .eq('employer_id', user.id)
        .single();

    if (checkError || !existingJob) {
        throw new Error('Job not found or you are not authorized to edit it.');
    }

    // 4. Update
    const { error: updateError } = await supabase
        .from('jobs')
        .update({
            title,
            company_name,
            location,
            salary,
            salary_min,
            salary_max,
            category,
            type,
            description,
            experience_level: experience_level || null,
            required_skills: required_skills || null,
            application_deadline: application_deadline || null,
            // updated_at: new Date().toISOString() // Supabase handles this usually, or add if needed
        })
        .eq('id', jobId)
        .eq('employer_id', user.id); // Extra safety

    if (updateError) {
        console.error('Update job error:', updateError);
        throw new Error('Failed to update job listing.');
    }

    // 5. Revalidate
    console.log(`Job ${jobId} updated successfully. Revalidating...`);
    revalidatePath(`/jobs/${jobId}`);
    revalidatePath('/dashboard');
    redirect(`/jobs/${jobId}`);
}

/**
 * Deletes a job listing.
 * @param jobId The UUID of the job to delete.
 */
export async function deleteJob(jobId: string) {
    console.log('🗑️ deleteJob called with jobId:', jobId);
    const supabase = await createActionClient();

    // 1. Authenticate
    const { data: { user } } = await supabase.auth.getUser();
    console.log('User:', user?.id);
    if (!user) {
        return { success: false, error: "Must be logged in" };
    }

    // 1.5 Verify employer role - CRITICAL SECURITY CHECK
    const { data: appUser, error: roleError } = await supabase
        .from('app_users')
        .select('role')
        .eq('id', user.id)
        .single();

    if (roleError || !appUser || appUser.role !== 'employer') {
        console.error('❌ Role check failed:', roleError, appUser);
        return { success: false, error: "Unauthorized: Only employers can delete jobs" };
    }
    console.log('✅ User is employer');

    try {
        // 2. Delete
        // We use deleted rows count to verify success
        const { error, count } = await supabase
            .from('jobs')
            .delete({ count: 'exact' })
            .eq('id', jobId)
            .eq('employer_id', user.id);

        console.log('Delete result:', { error, count });

        if (error) {
            console.error('❌ Delete job error:', error);
            return { success: false, error: "Failed to delete job" };
        }

        if (count === 0) {
            console.error('❌ No rows deleted (count = 0)');
            return { success: false, error: "Job not found or unauthorized to delete." };
        }

        console.log('✅ Job deleted successfully! Rows affected:', count);

        // 3. Revalidate
        revalidatePath('/dashboard');
        revalidatePath('/'); // Homepage might list it

        return { success: true };
    } catch (e) {
        return { success: false, error: getErrorMessage(e) };
    }
}