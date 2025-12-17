"use client";

import { useActionState, useState } from "react";
import { postJobListing, updateJob } from "@/actions/job-actions";
import { SubmitButton } from "@/components/submit-button";
import { Captcha } from "@/components/captcha";

interface JobFormProps {
    initialData?: {
        id: string;
        title: string;
        company_name: string;
        location: string;
        salary: string;
        salary_min: number;
        salary_max: number;
        category: string;
        type: string;
        description: string;
        experience_level: string | null;
        required_skills: string | null;
        application_deadline: string | null;
    };
    mode: "create" | "edit";
}

export function JobForm({ initialData, mode = "create" }: JobFormProps) {
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // We use the same server actions directly in the form's action prop
    // But for edit mode, we need to inject the jobId
    const handleSubmit = async (formData: FormData) => {
        // Only require CAPTCHA for new job postings
        if (mode === "create") {
            if (!captchaToken) {
                setError("Please complete the CAPTCHA verification");
                return;
            }
            formData.append("captchaToken", captchaToken);
        }

        setError(null);

        if (mode === "create") {
            await postJobListing(formData);
        } else {
            await updateJob(formData);
        }
    };

    return (
        <form action={handleSubmit} className="bg-card p-6 rounded-lg shadow-xl space-y-6 border border-border">
            {mode === "edit" && initialData && (
                <input type="hidden" name="jobId" value={initialData.id} />
            )}

            {/* Job Title */}
            <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium block">Job Title *</label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    defaultValue={initialData?.title}
                    className="w-full p-2 border border-input rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                    placeholder="e.g., Senior Mobile Developer"
                />
            </div>

            {/* Company Name & Category */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="space-y-2 flex-1">
                    <label htmlFor="company_name" className="text-sm font-medium block">Company Name *</label>
                    <input
                        type="text"
                        id="company_name"
                        name="company_name"
                        required
                        defaultValue={initialData?.company_name}
                        className="w-full p-2 border border-input rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                        placeholder="e.g., Ethio-Tech Solutions PLC"
                    />
                </div>
                <div className="space-y-2 flex-1">
                    <label htmlFor="category" className="text-sm font-medium block">Category *</label>
                    <select
                        id="category"
                        name="category"
                        required
                        defaultValue={initialData?.category || ""}
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
                <input
                    type="text"
                    id="location"
                    name="location"
                    defaultValue={initialData?.location}
                    className="w-full p-2 border border-input rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                    placeholder="e.g., Addis Ababa"
                />
            </div>

            {/* Salary Details */}
            <div className="flex flex-col md:flex-row gap-4">
                {/* Salary Label */}
                <div className="space-y-2 flex-[2]">
                    <label htmlFor="salary" className="text-sm font-medium block">Salary Label (Display)</label>
                    <input
                        type="text"
                        id="salary"
                        name="salary"
                        defaultValue={initialData?.salary}
                        className="w-full p-2 border border-input rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                        placeholder="e.g., Negotiable or 10k - 20k"
                    />
                </div>
                {/* Salary Min */}
                <div className="space-y-2 flex-1">
                    <label htmlFor="salary_min" className="text-sm font-medium block">Min Salary</label>
                    <input
                        type="number"
                        id="salary_min"
                        name="salary_min"
                        min="0"
                        defaultValue={initialData?.salary_min}
                        className="w-full p-2 border border-input rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                        placeholder="0"
                    />
                </div>
                {/* Salary Max */}
                <div className="space-y-2 flex-1">
                    <label htmlFor="salary_max" className="text-sm font-medium block">Max Salary</label>
                    <input
                        type="number"
                        id="salary_max"
                        name="salary_max"
                        min="0"
                        defaultValue={initialData?.salary_max}
                        className="w-full p-2 border border-input rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                        placeholder="0"
                    />
                </div>
            </div>

            {/* Job Type */}
            <div className="space-y-2">
                <label className="text-sm font-medium block">Job Type</label>
                <div className="flex gap-4 flex-wrap">
                    {['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'].map(type => (
                        <div key={type} className="flex items-center space-x-2">
                            <input
                                type="radio"
                                id={type}
                                name="type"
                                value={type}
                                defaultChecked={initialData ? initialData.type === type : type === 'Full-time'}
                                className="text-primary focus:ring-primary h-4 w-4 border-gray-300"
                            />
                            <label htmlFor={type} className="text-sm">{type}</label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Experience & Deadline */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="space-y-2 flex-1">
                    <label htmlFor="experience_level" className="text-sm font-medium block">Experience Level *</label>
                    <select
                        id="experience_level"
                        name="experience_level"
                        required
                        defaultValue={initialData?.experience_level || ""}
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
                    <input
                        type="date"
                        id="application_deadline"
                        name="application_deadline"
                        required
                        defaultValue={initialData?.application_deadline ? new Date(initialData.application_deadline).toISOString().split('T')[0] : ""}
                        className="w-full p-2 border border-input rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                    />
                </div>
            </div>

            {/* Required Skills */}
            <div className="space-y-2">
                <label htmlFor="required_skills" className="text-sm font-medium block">Required Skills *</label>
                <textarea
                    id="required_skills"
                    name="required_skills"
                    rows={3}
                    required
                    defaultValue={initialData?.required_skills || ""}
                    className="w-full p-2 border border-input rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background resize-none"
                    placeholder="List key skills required for this role (e.g. React, Node.js, Project Management)..."
                />
            </div>

            {/* Job Description */}
            <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium block">Job Description *</label>
                <textarea
                    id="description"
                    name="description"
                    rows={8}
                    required
                    defaultValue={initialData?.description}
                    className="w-full p-2 border border-input rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background resize-none"
                    placeholder="Provide a detailed description of the role, responsibilities, and qualifications."
                />
            </div>

            {/* CAPTCHA - Only for new job postings */}
            {mode === "create" && (
                <Captcha
                    onVerify={(token) => setCaptchaToken(token)}
                    onExpire={() => setCaptchaToken(null)}
                    onError={() => {
                        setCaptchaToken(null);
                        setError("CAPTCHA error. Please try again.");
                    }}
                />
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}

            {/* Submit Button */}
            <SubmitButton
                text={mode === "create" ? "Post Job Listing" : "Update Job Listing"}
                loadingText={mode === "create" ? "Posting..." : "Updating..."}
            />
        </form>
    );
}
