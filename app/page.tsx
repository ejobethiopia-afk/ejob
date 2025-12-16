import Link from "next/link";
import { createClient } from '@/lib/supabase/server';
import { EthiopianHero } from "@/components/ui/ethiopian-hero";
import { JobCardPremium } from "@/components/ui/job-card-premium";
import { Job } from "@/types";

export default async function Home() {
  // 1. Initialize Supabase Connection
  const supabase = await createClient();

  // 2. Fetch the Jobs data from the 'jobs' table
  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  // Basic error handling
  if (error) {
    console.error('Error fetching jobs:', error);
  }

  return (
    <div className="flex flex-col bg-background">
      {/* --- HERO SECTION --- */}
      <EthiopianHero />

      {/* --- MAIN JOB BOARD CONTENT --- */}
      <div className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-12 mb-20">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 border-b pb-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Latest Opportunities</h2>
            <p className="text-muted-foreground mt-1">Explore top jobs from leading Ethiopian companies.</p>
          </div>
          <Link href="/jobs" className="text-sm font-medium text-[#009A44] hover:underline underline-offset-4">
            View All Jobs &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs && jobs.length > 0 ? (
            // Deduplicate jobs by title and company to avoid showing repeats
            jobs.filter((job, index, self) =>
              index === self.findIndex((t) => (
                t.title === job.title && t.company_name === job.company_name
              ))
            ).map((job: Job) => (
              <JobCardPremium key={job.id} job={job} />
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-muted/30 rounded-lg border-dashed border-2">
              <p className="text-lg text-muted-foreground">No jobs posted yet.</p>
              <p className="text-sm">Start by posting a job in the Supabase Table Editor.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 🔑 FINAL FIX: Force the page to render dynamically on every request
export const dynamic = 'force-dynamic';