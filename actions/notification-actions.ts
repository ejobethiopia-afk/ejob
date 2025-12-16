"use server";

import { createActionClient } from "@/lib/supabase/server";

/**
 * Create a single notification row for a user.
 */
export async function createNotification(userId: string, message: string, linkUrl?: string) {
    const supabase = await createActionClient();
    const { error } = await supabase.from('notifications').insert({ user_id: userId, message, link_url: linkUrl || null });
    if (error) {
        console.error('Failed to create notification', error);
        return { error: error.message };
    }
    return { success: true };
}

export async function getNotificationsForUser(userId: string, limit = 50) {
    const supabase = await createActionClient();
    const { data, error } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit);
    if (error) {
        console.error('Failed to fetch notifications', error);
        return { error: error.message };
    }
    return { data };
}

export async function markNotificationRead(id: number | string) {
    const supabase = await createActionClient();
    // Supabase can usually handle number or string for eq() on bigint/PK
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id); 
    if (error) {
        console.error('Failed to mark notification read', error);
        return { error: error.message };
    }
    // You should revalidate the path where notifications are displayed after marking read
    // e.g., revalidatePath('/dashboard/notifications');
    return { success: true };
}

/**
 * Job matching engine stub - intended to be run on a schedule (cron or edge function).
 * This implementation is a minimal placeholder demonstrating the steps:
 * - fetch seekers
 * - for each seeker, find matching jobs (requires `jobs` table)
 * - insert notifications and queue emails as needed
 */
export async function runJobMatching() {
    const supabase = await createActionClient();

    // NOTE: This is a high-level stub. Implement detailed matching using your `jobs` table schema.
    try {
        const { data: seekers } = await supabase.from('job_seeker_profiles').select('user_id, skills, location, experience');
        if (!seekers) return { success: true };

        for (const seeker of seekers) {
            const seekerId = seeker.user_id;
            // Example: query jobs where skills overlap - requires jobs.skill to be an array or jsonb
            // const { data: jobs } = await supabase.from('jobs').select('*').overlaps('skills', seeker.skills).limit(10);

            // For now, just create a dummy notification to indicate the stub ran
            await supabase.from('notifications').insert({ user_id: seekerId, message: 'We found new jobs matching your profile', link_url: null });
        }

        return { success: true };
    } catch (e) {
        console.error('Job matching failed', e);
        return { error: String(e) };
    }
}
