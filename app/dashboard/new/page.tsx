// app/dashboard/new/page.tsx

import { createActionClient } from "@/lib/supabase/server";
import { redirect } from 'next/navigation';
import { NewJob } from "@/types";
import { postJobListing } from '@/actions/job-actions';
import { SubmitButton } from "@/components/submit-button";
import { JobForm } from "@/components/job-form";

// Use centralized server action to post jobs

// ... (rest of the NewJobPage component remains the same)

export default async function NewJobPage() {
    // 1. Check authentication
    const supabase = await createActionClient();
    const { data } = await supabase.auth.getUser();

    if (!data?.user) {
        redirect('/login');
    }

    // 2. Query app_users table to get user role
    const { data: appUser, error: roleError } = await supabase
        .from('app_users')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();

    // If employer, ensure profile exists before allowing access
    if (appUser?.role === 'employer') {
        const { data: profile } = await supabase.from('profiles').select('id').eq('id', data.user.id).maybeSingle();
        if (!profile) {
            redirect('/dashboard/profile-setup');
        }
    }

    // 3. Authorization gate: only employers can access this page
    if (roleError || !appUser || appUser.role !== 'employer') {
        redirect('/dashboard'); // Redirect non-employers to dashboard
    }

    return (
        <main className="min-h-screen flex justify-center p-5 pt-12">
            <div className="max-w-xl w-full">
                <a href="/dashboard" className="text-primary hover:underline mb-6 inline-block">
                    &larr; Back to Dashboard
                </a>

                <h1 className="text-3xl font-bold mb-8">Post a New Job Listing</h1>

                <JobForm mode="create" />
            </div>
        </main>
    );
}