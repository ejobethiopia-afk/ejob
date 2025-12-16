// app/dashboard/page.tsx

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

// Define the Job structure used for the listing
interface Job {
    id: string;
    title: string;
    company_name: string;
    location: string;
    salary: string;
    type: string;
    created_at: string;
}

export default async function DashboardPage() {
    const supabase = await createClient();

    // 1. Get the current user's session
    const { data: userData } = await supabase.auth.getUser();

    // If no user is logged in, redirect them to the login page
    if (!userData?.user) {
        redirect('/login');
    }

    const currentUserId = userData.user.id;

    // 2. Fetch jobs posted by the current user
    // If employer, ensure profile exists (redirect to setup if missing)
    const { data: appUser } = await supabase.from('app_users').select('role').eq('id', currentUserId).maybeSingle();
    if (appUser?.role === 'employer') {
        const { data: profile } = await supabase.from('profiles').select('id').eq('id', currentUserId).maybeSingle();
        if (!profile) {
            redirect('/dashboard/profile-setup');
        }
    }

    const { data: jobs, error } = await supabase
        .from('jobs')
        .select('*')
        // 🔑 CRITICAL: Filter jobs where the 'employer_id' matches the current user's ID
        .eq('employer_id', currentUserId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching user's jobs:", error);
        // You might want to handle this error more gracefully in a real app
        return <div className="p-8 text-center text-red-500">Failed to load your job listings.</div>;
    }

    const postedJobs = (jobs || []) as Job[];

    return (
        <main className="min-h-screen p-5 pt-12">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-4xl font-extrabold text-primary">Your Job Dashboard</h1>
                    <Link
                        href="/dashboard/new"
                        className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-colors shadow-lg"
                    >
                        + Post New Job
                    </Link>
                </div>

                {/* --- Job Listings --- */}
                {postedJobs.length === 0 ? (
                    <div className="text-center p-10 bg-card rounded-lg border border-border">
                        <p className="text-xl text-foreground/70 mb-4">You haven't posted any jobs yet.</p>
                        <Link
                            href="/dashboard/new"
                            className="text-primary hover:underline font-medium"
                        >
                            Start by posting your first job!
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {postedJobs.map((job) => (
                            <div
                                key={job.id}
                                className="bg-card p-6 rounded-lg shadow-md border border-border flex justify-between items-center transition duration-200 hover:shadow-lg"
                            >
                                <div>
                                    <h2 className="text-xl font-bold mb-1">{job.title}</h2>
                                    <p className="text-sm text-foreground/70 mb-2">{job.company_name} &middot; {job.location}</p>
                                    <p className="text-xs text-foreground/50">Posted on: {new Date(job.created_at).toLocaleDateString()}</p>
                                </div>
                                <Link
                                    // Link to the job detail page for viewing
                                    href={`/jobs/${job.id}`}
                                    className="px-4 py-2 bg-secondary text-secondary-foreground font-medium rounded-md hover:bg-secondary/80 transition-colors"
                                >
                                    View Details &rarr;
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}