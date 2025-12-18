"use server";

import { createActionClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * Set user role for OAuth users who skipped signup form
 * Uses UPSERT to handle cases where database trigger might not have created the record yet
 */
export async function setUserRole(role: 'job_seeker' | 'employer') {
    const supabase = await createActionClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: "Not authenticated" };
    }

    console.log('Setting user role:', { userId: user.id, role });

    // UPSERT instead of UPDATE - creates record if it doesn't exist
    const { error } = await supabase
        .from('app_users')
        .upsert({
            id: user.id,
            email: user.email!,
            role: role,
            updated_at: new Date().toISOString(),
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            username: user.email?.split('@')[0]?.toLowerCase().replace(/[^a-z0-9_]/g, '_').substring(0, 20) || `user_${user.id.substring(0, 8)}`,
            avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
        }, { onConflict: 'id' });

    if (error) {
        console.error('Error upserting user role:', error);
        return { error: error.message };
    }

    console.log('Successfully set user role to:', role);

    // Revalidate paths
    revalidatePath('/');
    revalidatePath('/dashboard');

    // Redirect based on role
    if (role === 'employer') {
        redirect('/dashboard');
    } else {
        redirect('/jobs');
    }
}
