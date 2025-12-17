import { createActionClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { JobForm } from "@/components/job-form";

interface EditJobPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditJobPage({ params }: EditJobPageProps) {
    const { id } = await params;
    const supabase = await createActionClient();

    // 1. Authenticate
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect("/login");
    }

    // 2. Fetch Job Data (verifying ownership)
    const { data: job, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .eq("employer_id", user.id)
        .single();

    if (error || !job) {
        // Redirect or show error if job not found or not owned by user
        redirect("/dashboard");
    }

    // 3. Render Form in Edit Mode
    return (
        <div className="min-h-screen flex justify-center p-5 pt-12">
            <div className="max-w-xl w-full">
                <a
                    href="/dashboard"
                    className="text-primary hover:underline mb-6 inline-block"
                >
                    &larr; Back to Dashboard
                </a>

                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">Edit Job Listing</h1>
                </div>

                <JobForm mode="edit" initialData={job} />
            </div>
        </div>
    );
}
