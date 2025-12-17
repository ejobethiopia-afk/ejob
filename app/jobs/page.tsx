// app/jobs/page.tsx
'use client';

import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import SaveJobButton from '@/components/SaveJobButton';

interface Job {
  id: string;
  title: string;
  company_name: string;
  location: string;
  description: string;
  type: string;
  salary?: string;
  created_at: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select('*')
          .order('created_at', { ascending: false });

        if (jobsError) throw jobsError;

        console.log('Fetched jobs:', jobsData);
        setJobs(jobsData || []);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError(err instanceof Error ? err.message : 'Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [supabase, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Available Jobs</h1>
          <div className="text-center">Loading jobs...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Available Jobs</h1>
          <div className="bg-card p-8 rounded-lg shadow-sm border border-red-200">
            <p className="text-center text-red-500">Error loading jobs: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Available Jobs</h1>
          <div className="bg-card p-8 rounded-lg shadow-sm border">
            <p className="text-center text-muted-foreground">No jobs available at the moment. Please check back later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Available Jobs</h1>

        <div className="space-y-6">
          {jobs.map((job) => (
            <div key={job.id} className="bg-card p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">
                    <Link href={`/jobs/${job.id}`} className="hover:underline">
                      {job.title}
                    </Link>
                  </h2>
                  <p className="text-muted-foreground">{job.company_name}</p>
                  <p className="text-muted-foreground">{job.location}</p>
                  <p className="mt-2 text-sm">{job.description?.substring(0, 200)}...</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full">
                    {job.type || 'Full-time'}
                  </span>
                  {job.salary && (
                    <p className="text-sm font-medium">{job.salary}</p>
                  )}
                </div>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {new Date(job.created_at).toLocaleDateString()}
                </span>
                <Link
                  href={`/jobs/${job.id}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
