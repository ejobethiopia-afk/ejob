import { createClient } from "@/lib/supabase/server";
import { Application, Job } from "@/types";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function JobApplicationsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const jobId = id;
    const supabase = await createClient();

    // 1. Check Authentication
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    // 2. Check Authorization (Is this user the employer?)
    const { data: job } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", jobId)
        .single();

    if (!job) {
        return <div className="p-8 text-center">Job not found.</div>;
    }

    // Cast job to Job type if needed, or rely on inference
    const jobData = job as Job;

    if (jobData.employer_id !== user.id) {
        return (
            <div className="p-8 text-center text-red-500">
                Unauthorized: You are not the owner of this job posting.
            </div>
        );
    }

    // 3. Fetch Applications joined with Profiles
    const { data: applications, error } = await supabase
        .from("applications")
        .select(`
      *,
      profiles:applicant_id (
        id,
        email,
        full_name,
        avatar_url
      )
    `)
        .eq("job_id", jobId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching applications:", error);
        return (
            <div className="p-8 text-center text-red-500">
                Failed to load applications.
            </div>
        );
    }

    const apps = (applications as unknown) as Application[];

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="mb-6 flex items-center gap-4">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Applications for: {jobData.title}</h1>
                    <p className="text-gray-500">
                        {apps.length} {apps.length === 1 ? "applicant" : "applicants"} found
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow border overflow-hidden">
                {apps.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        No applications received yet.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-zinc-800 border-b">
                                <tr>
                                    <th className="p-4 font-semibold">Applicant</th>
                                    <th className="p-4 font-semibold">Email</th>
                                    <th className="p-4 font-semibold">Applied Date</th>
                                    <th className="p-4 font-semibold">Status</th>
                                    <th className="p-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {apps.map((app) => (
                                    <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                                        <td className="p-4">
                                            {app.profiles?.full_name || "Unknown Name"}
                                        </td>
                                        <td className="p-4 font-mono text-xs">
                                            {app.profiles?.email || "No Email"}
                                        </td>
                                        <td className="p-4">
                                            {new Date(app.created_at).toLocaleDateString()} at{" "}
                                            {new Date(app.created_at).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </td>
                                        <td className="p-4">
                                            <span
                                                className={`inline-flex px-2 py-1 text-xs rounded-full border ${app.status === "pending"
                                                        ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                                        : app.status === "reviewed"
                                                            ? "bg-blue-100 text-blue-800 border-blue-200"
                                                            : "bg-gray-100 text-gray-800 border-gray-200"
                                                    }`}
                                            >
                                                {app.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            {/* Placeholder for future CV viewing or status updates */}
                                            <Button variant="outline" size="sm" disabled>
                                                View CV
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
