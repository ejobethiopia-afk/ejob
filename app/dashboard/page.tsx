import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { JobActionsMenu } from '@/components/job-actions-menu';

// Define the Job structure used for the listing
interface Job {
    id: string;
    title: string;
    company_name: string;
    location: string;
    salary: string;
    type: string;
    created_at: string;
    views_count?: number;
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

    // 2. Check Role & fetch user data
    const { data: appUser } = await supabase.from('app_users').select('role').eq('id', currentUserId).single();

    // Redirect non-employers
    if (appUser?.role !== 'employer') {
        redirect('/');
    }

    // Validate Employer Profile
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', currentUserId).maybeSingle();
    if (!profile) {
        redirect('/dashboard/profile-setup');
    }

    // 3. Fetch Data - Use distinct to prevent duplicates
    const { data: jobs, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('employer_id', currentUserId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching user's jobs:", error);
        return <div className="p-8 text-center text-red-500">Failed to load your dashboard.</div>;
    }

    console.log('Raw jobs fetched:', jobs?.length);

    // Enhanced deduplication - remove jobs with same title, company, and location
    // This handles cases where duplicate jobs were created with different IDs
    const uniqueJobs = jobs ? Array.from(
        new Map(
            jobs.map((job: Job) => [
                `${job.title}-${job.company_name}-${job.location}-${job.type}`,
                job
            ])
        ).values()
    ) : [];

    console.log('After deduplication:', uniqueJobs.length);

    const postedJobs = uniqueJobs as Job[];

    // Calculate Stats
    const totalJobs = postedJobs.length;
    const totalViews = postedJobs.reduce((acc, job) => acc + (job.views_count || 0), 0);

    // 4. Fetch Applications Count (Real Data)
    // We only want applications for the jobs that belong to this employer
    // Since we already have the job IDs, we can use 'in' filter
    const jobIds = postedJobs.map(j => j.id);
    let totalApplications = 0;

    if (jobIds.length > 0) {
        const { count, error: countError } = await supabase
            .from('applications')
            .select('*', { count: 'exact', head: true })
            .in('job_id', jobIds);

        if (!countError) {
            totalApplications = count || 0;
        } else {
            console.error("Error fetching application count:", countError);
        }
    }

    return (
        <main className="min-h-screen bg-muted/10 p-6 md:p-12">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Employer Dashboard</h1>
                        <p className="text-muted-foreground">Manage your job postings and view performance.</p>
                    </div>
                    <Link
                        href="/dashboard/new"
                        className="px-6 py-2.5 bg-[#009A44] text-white font-medium rounded-lg hover:bg-[#007A35] transition-all shadow-md flex items-center gap-2"
                    >
                        <span>+</span> Post New Job
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-card p-6 rounded-xl border shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                        <span className="text-muted-foreground text-sm font-medium uppercase tracking-wider mb-2">Active Jobs</span>
                        <span className="text-4xl font-extrabold text-foreground">{totalJobs}</span>
                    </div>
                    <div className="bg-card p-6 rounded-xl border shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                        <span className="text-muted-foreground text-sm font-medium uppercase tracking-wider mb-2">Total Views</span>
                        <span className="text-4xl font-extrabold text-[#009A44]">{totalViews}</span>
                    </div>
                    <div className="bg-card p-6 rounded-xl border shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                        <span className="text-muted-foreground text-sm font-medium uppercase tracking-wider mb-2">Total Applications</span>
                        <span className="text-4xl font-extrabold text-[#FEDD00]">{totalApplications}</span>
                    </div>
                </div>

                {/* Job List */}
                <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                    <div className="p-6 border-b flex justify-between items-center bg-muted/5">
                        <h2 className="font-semibold text-lg">Recent Job Postings</h2>
                    </div>

                    {postedJobs.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">💼</span>
                            </div>
                            <h3 className="text-lg font-medium mb-2">No jobs posted yet</h3>
                            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Create your first job listing to start finding great talent.</p>
                            <Link href="/dashboard/new" className="text-[#009A44] font-medium hover:underline">
                                Create Job Listing &rarr;
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {postedJobs.map((job) => (
                                <div key={job.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/5 transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="font-bold text-lg truncate text-[#009A44]">{job.title}</h3>
                                            <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                                                {job.type}
                                            </span>
                                        </div>
                                        <div className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                                            <span>{job.company_name}</span>
                                            <span>&bull;</span>
                                            <span>{job.location}</span>
                                            <span>&bull;</span>
                                            <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                                            <span>&bull;</span>
                                            <span className="text-foreground font-medium">{job.views_count || 0} views</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 self-start md:self-center">
                                        <JobActionsMenu jobId={job.id} jobTitle={job.title} />
                                        <Link
                                            href={`/jobs/${job.id}`}
                                            className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-secondary transition-colors"
                                        >
                                            View
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}