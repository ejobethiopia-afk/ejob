import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ApplyButton from '@/components/apply-button';
import ApplicationForm from '@/components/ApplicationForm';
import SaveJobButton from '@/components/SaveJobButton';
import { Job } from '@/types';
import { Eye, Layers } from 'lucide-react';
import { getSavedStatus, submitApplicationWithForm } from '@/actions/job-actions';
import ViewCounter from '@/components/view-counter';

interface JobDetailPageProps {
    params: Promise<{
        id: string;
    }>
}

export default async function JobDetailPage(props: JobDetailPageProps) {
    const params = await props.params;
    const jobId = params.id;

    // 1. Initialize Supabase Connection
    const supabase = await createClient();

    // 2. Fetch the single job listing based on the ID
    const { data: job, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

    // 3. Handle errors
    if (error || !job) {
        notFound();
    }

    const jobData = job as Job;

    // 4. Fetch Saved Status & User Role
    const { data: { user } } = await supabase.auth.getUser();
    const isSaved = user ? await getSavedStatus(jobId) : false;

    let isEmployer = false;
    if (user) {
        const { data: appUser } = await supabase
            .from('app_users')
            .select('role')
            .eq('id', user.id)
            .single();
        isEmployer = appUser?.role === 'employer';
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Hero Section with Job Title */}
            <div className="relative w-full py-20 px-6 overflow-hidden bg-zinc-900 border-b border-white/10">
                {/* Background Gradient */}
                <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d]">
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,154,68,0.2),rgba(254,221,0,0.2),rgba(214,0,28,0.2))]" />
                    <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-[#009A44] via-[#FEDD00] to-[#D6001C]" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto">
                    <Link href="/" className="inline-flex items-center text-white/80 hover:text-[#FEDD00] hover:underline mb-6 transition-colors">
                        &larr; Back to Job Listings
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight drop-shadow-sm">{jobData.title}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-white/90">
                        <h2 className="text-xl font-semibold text-[#FEDD00]">{jobData.company_name}</h2>
                        <span className="hidden sm:block text-white/40">•</span>
                        <span className="flex items-center gap-1">
                            📍 {jobData.location}
                        </span>
                        <span className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded text-sm">
                            💼 {jobData.type}
                        </span>
                        <span className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded text-sm">
                            <Layers className="w-4 h-4" /> {jobData.category}
                        </span>
                        {isEmployer && (
                            <span className="flex items-center gap-1 text-sm text-white/60">
                                <Eye className="w-4 h-4" /> {jobData.views_count || 0} views
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-12 -mt-10 relative z-20">
                <div className="grid md:grid-cols-[1fr_300px] gap-8">
                    {/* Main Content */}
                    <div className="bg-card p-8 rounded-xl shadow-xl border border-border">
                        {isEmployer && <ViewCounter jobId={jobId} />}
                        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                            <h3 className="text-2xl font-bold border-b-2 border-[#009A44] pb-1 inline-block">Job Description</h3>
                            <span className="text-lg font-bold text-[#009A44]">{jobData.salary}</span>
                        </div>

                        {/* New Metadata Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 bg-muted/20 p-4 rounded-lg">
                            {jobData.experience_level && (
                                <div>
                                    <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Experience Level</span>
                                    <p className="font-medium">{jobData.experience_level}</p>
                                </div>
                            )}
                            {jobData.application_deadline && (
                                <div>
                                    <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Deadline</span>
                                    <p className="font-medium text-red-500/90">{new Date(jobData.application_deadline).toLocaleDateString()}</p>
                                </div>
                            )}
                        </div>

                        {jobData.required_skills && (
                            <div className="mb-6">
                                <h4 className="text-lg font-semibold mb-2">Required Skills</h4>
                                <div className="flex flex-wrap gap-2">
                                    {jobData.required_skills.split(/,|\n/).map(s => s.trim()).filter(Boolean).map((skill, idx) => (
                                        <span key={idx} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="prose dark:prose-invert max-w-none text-foreground/80 leading-relaxed whitespace-pre-line">
                            {jobData.description}
                        </div>
                    </div>

                    {/* Sidebar / Application */}
                    <div className="space-y-6">
                        <div className="bg-card p-6 rounded-xl shadow-lg border border-border sticky top-24">
                            <h3 className="text-xl font-bold mb-4">
                                {isEmployer ? "Job Options" : "Ready to Apply?"}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-6">
                                {isEmployer
                                    ? "Manage this job or save it for later reference."
                                    : `Don't miss this opportunity to join ${jobData.company_name}.`
                                }
                            </p>

                            <div className="flex gap-2">
                                {!isEmployer && (
                                    <div className="flex-1">
                                        <ApplicationForm jobId={jobData.id} />
                                    </div>
                                )}
                                <SaveJobButton jobId={jobData.id} initialIsSaved={isSaved} />
                            </div>

                            <div className="mt-6 pt-6 border-t border-border text-xs text-center text-muted-foreground">
                                Posted on {new Date(jobData.created_at).toLocaleDateString()}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-[#009A44]/10 to-[#FEDD00]/10 p-6 rounded-xl border border-[#009A44]/20">
                            <h4 className="font-semibold mb-2 text-[#009A44]">Why Ejob Ethiopia?</h4>
                            <p className="text-xs text-muted-foreground">
                                We connect you with verified employers ensuring a safe and professional hiring process.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export const dynamic = 'force-dynamic';