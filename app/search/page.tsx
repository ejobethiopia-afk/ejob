'use client';

import { createClient } from '@/lib/supabase/client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { JobCardPremium } from '@/components/ui/job-card-premium';
import { Job } from '@/types';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

function SearchResults() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchJobs = async () => {
            if (!query) {
                setLoading(false);
                setJobs([]);
                return;
            }

            setLoading(true);
            setError(null);
            const supabase = createClient();

            try {
                // Perform a text search or pattern match on title, description, company
                const { data, error } = await supabase
                    .from('jobs')
                    .select('*')
                    .or(`title.ilike.%${query}%,company_name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setJobs(data as Job[] || []);
            } catch (err: any) {
                console.error('Search error:', err);
                setError(err.message || 'Failed to search jobs');
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, [query]);

    return (
        <div className="container mx-auto max-w-7xl p-6 min-h-screen">
            <div className="mb-8">
                <Link href="/" className="text-sm text-muted-foreground hover:text-green-600 mb-4 inline-block">
                    &larr; Back to Home
                </Link>
                <h1 className="text-3xl font-bold">
                    Search Results for <span className="text-green-600">"{query}"</span>
                </h1>
                <p className="text-muted-foreground mt-2">
                    Found {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} matching your criteria
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                </div>
            ) : error ? (
                <div className="p-4 border border-red-200 bg-red-50 text-red-600 rounded-lg">
                    {error}
                </div>
            ) : jobs.length === 0 ? (
                <div className="text-center py-20 bg-muted/30 rounded-lg border-2 border-dashed">
                    <h3 className="text-lg font-semibold text-muted-foreground">No jobs found</h3>
                    <p className="text-sm text-gray-500 mt-2">Try searching for different keywords or check your spelling.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobs.map((job) => (
                        <JobCardPremium key={job.id} job={job} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center">Loading search...</div>}>
            <SearchResults />
        </Suspense>
    );
}
