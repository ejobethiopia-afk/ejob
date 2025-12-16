import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { JobCardPremium } from "@/components/ui/job-card-premium";
import Link from 'next/link';

// Define a type for the joined query result
// Supabase returns an array of objects where the joined table is a nested object or array
interface SavedJobJoin {
    id: number;
    created_at: string;
    jobs: any; // We'll cast this to Job later
}

export default async function SavedJobsPage() {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData?.user) {
        redirect('/login');
    }

    // Fetch saved jobs joined with the actual job details
    const { data: savedJobsData, error } = await supabase
        .from('saved_jobs')
        .select(`
            id,
            created_at,
            jobs (*)
        `)
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching saved jobs:", error);
        return (
            <div className="p-12 text-center">
                <h1 className="text-2xl font-bold text-red-500">Error loading saved jobs</h1>
                <p className="text-muted-foreground">Please try again later.</p>
            </div>
        );
    }

    // Filter out any entries where the job might have been deleted (jobs would be null)
    // And map to just the Job object for the card
    const jobs = (savedJobsData || [])
        .map((item: any) => item.jobs)
        .filter((job: any) => job !== null);

    return (
        <div className="flex flex-col bg-background min-h-screen">
            <div className="w-full max-w-7xl mx-auto p-6 md:p-12">
                <div className="mb-8">
                    <Link href="/dashboard" className="text-primary hover:underline mb-2 inline-block">
                        &larr; Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">Your Saved Jobs</h1>
                    <p className="text-muted-foreground mt-1">
                        {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} saved for later.
                    </p>
                </div>

                {jobs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobs.map((job: any) => (
                            <JobCardPremium key={job.id} job={job} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-muted/30 rounded-lg border-dashed border-2">
                        <p className="text-lg text-muted-foreground">You haven't saved any jobs yet.</p>
                        <Link href="/" className="text-primary hover:underline mt-2 inline-block">
                            Browse Jobs &rarr;
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export const dynamic = 'force-dynamic';
