"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { setUserRole } from "@/actions/set-user-role";
import { Briefcase, Search } from "lucide-react";

export default function SelectRolePage() {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState<'job_seeker' | 'employer' | null>(null);

    const handleRoleSelection = async (role: 'job_seeker' | 'employer') => {
        setIsLoading(true);
        setSelectedRole(role);
        await setUserRole(role);
        // Redirect handled by server action
    };

    return (
        <div className="container max-w-2xl mx-auto py-16 px-4">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">Welcome to Ejob Ethiopia!</h1>
                <p className="text-lg text-muted-foreground">
                    Choose how you want to use our platform
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <button
                    onClick={() => handleRoleSelection('job_seeker')}
                    disabled={isLoading}
                    className="group relative overflow-hidden rounded-lg border-2 border-border hover:border-primary transition-all p-8 text-left bg-card hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <div className="flex flex-col items-center text-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <Search className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Job Seeker</h2>
                            <p className="text-muted-foreground">
                                I'm looking for job opportunities in Ethiopia
                            </p>
                        </div>
                        {isLoading && selectedRole === 'job_seeker' && (
                            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                            </div>
                        )}
                    </div>
                </button>

                <button
                    onClick={() => handleRoleSelection('employer')}
                    disabled={isLoading}
                    className="group relative overflow-hidden rounded-lg border-2 border-border hover:border-primary transition-all p-8 text-left bg-card hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <div className="flex flex-col items-center text-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <Briefcase className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Employer</h2>
                            <p className="text-muted-foreground">
                                I want to post jobs and hire talented professionals
                            </p>
                        </div>
                        {isLoading && selectedRole === 'employer' && (
                            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                            </div>
                        )}
                    </div>
                </button>
            </div>
        </div>
    );
}
