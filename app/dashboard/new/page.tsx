// app/dashboard/new/page.tsx

import { createActionClient } from "@/lib/supabase/server";
import { redirect } from 'next/navigation';
import { NewJob } from "@/types";
import { postJobListing } from '@/actions/job-actions';
import { SubmitButton } from "@/components/submit-button";

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

                {/* The form calls the centralized postJobListing Server Action */}
                <form action={postJobListing} className="bg-card p-6 rounded-lg shadow-xl space-y-6 border border-border">

                    {/* Job Title */}
                    <div className="space-y-2">
                        <label htmlFor="title" className="text-sm font-medium block">Job Title *</label>
                        <input type="text" id="title" name="title" required
                            className="w-full p-2 border border-input rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                            placeholder="e.g., Senior Mobile Developer" />
                    </div>

                    {/* Company Name & Category */}
                    <div className="flex gap-4">
                        <div className="space-y-2 flex-1">
                            <label htmlFor="company_name" className="text-sm font-medium block">Company Name *</label>
                            <input type="text" id="company_name" name="company_name" required
                                className="w-full p-2 border border-input rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                                placeholder="e.g., Ethio-Tech Solutions PLC" />
                        </div>
                        <div className="space-y-2 flex-1">
                            <label htmlFor="category" className="text-sm font-medium block">Category *</label>
                            <select id="category" name="category" required
                                className="w-full p-2 border border-input rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                            >
                                <option value="">Select a Category</option>
                                <option value="Technology">Technology</option>
                                <option value="Healthcare">Healthcare</option>
                                <option value="Education">Education</option>
                                <option value="Finance">Finance</option>
                                <option value="Construction">Construction</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                        <label htmlFor="location" className="text-sm font-medium block">Location</label>
                        <input type="text" id="location" name="location"
                            className="w-full p-2 border border-input rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                            placeholder="e.g., Addis Ababa" />
                    </div>

                    {/* Salary Details */}
                    <div className="flex gap-4">
                        {/* Salary Label */}
                        <div className="space-y-2 flex-[2]">
                            <label htmlFor="salary" className="text-sm font-medium block">Salary Label (Display)</label>
                            <input type="text" id="salary" name="salary"
                                className="w-full p-2 border border-input rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                                placeholder="e.g., Negotiable or 10k - 20k" />
                        </div>
                        {/* Salary Min */}
                        <div className="space-y-2 flex-1">
                            <label htmlFor="salary_min" className="text-sm font-medium block">Min Salary</label>
                            <input type="number" id="salary_min" name="salary_min"
                                className="w-full p-2 border border-input rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                                placeholder="0" min="0" />
                        </div>
                        {/* Salary Max */}
                        <div className="space-y-2 flex-1">
                            <label htmlFor="salary_max" className="text-sm font-medium block">Max Salary</label>
                            <input type="number" id="salary_max" name="salary_max"
                                className="w-full p-2 border border-input rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                                placeholder="0" min="0" />
                        </div>
                    </div>

                    {/* Job Type */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium block">Job Type</label>
                        <div className="flex gap-4 flex-wrap">
                            {['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'].map(type => (
                                <div key={type} className="flex items-center space-x-2">
                                    <input type="radio" id={type} name="type" value={type} defaultChecked={type === 'Full-time'}
                                        className="text-primary focus:ring-primary h-4 w-4 border-gray-300" />
                                    <label htmlFor={type} className="text-sm">{type}</label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Experience & Deadline */}
                    <div className="flex gap-4">
                        <div className="space-y-2 flex-1">
                            <label htmlFor="experience_level" className="text-sm font-medium block">Experience Level *</label>
                            <select id="experience_level" name="experience_level" required
                                className="w-full p-2 border border-input rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                            >
                                <option value="">Select Level</option>
                                <option value="Entry Level (0-2 years)">Entry Level (0-2 years)</option>
                                <option value="Junior (2-4 years)">Junior (2-4 years)</option>
                                <option value="Mid Level (4-6 years)">Mid Level (4-6 years)</option>
                                <option value="Senior (7+ years)">Senior (7+ years)</option>
                                <option value="Manager">Manager</option>
                                <option value="Executive">Executive</option>
                            </select>
                        </div>
                        <div className="space-y-2 flex-1">
                            <label htmlFor="application_deadline" className="text-sm font-medium block">Application Deadline *</label>
                            <input type="date" id="application_deadline" name="application_deadline" required
                                className="w-full p-2 border border-input rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                            />
                        </div>
                    </div>

                    {/* Required Skills */}
                    <div className="space-y-2">
                        <label htmlFor="required_skills" className="text-sm font-medium block">Required Skills *</label>
                        <textarea id="required_skills" name="required_skills" rows={3} required
                            className="w-full p-2 border border-input rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background resize-none"
                            placeholder="List key skills required for this role (e.g. React, Node.js, Project Management)..." />
                    </div>

                    {/* Job Description */}
                    <div className="space-y-2">
                        <label htmlFor="description" className="text-sm font-medium block">Job Description *</label>
                        <textarea id="description" name="description" rows={8} required
                            className="w-full p-2 border border-input rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background resize-none"
                            placeholder="Provide a detailed description of the role, responsibilities, and qualifications." />
                    </div>

                    {/* Submit Button */}
                    <SubmitButton text="Post Job Listing" loadingText="Posting..." />
                </form>
            </div>
        </main>
    );
}