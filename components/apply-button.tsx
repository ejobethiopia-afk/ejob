"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { submitApplication } from "@/actions/job-actions";
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ApplyButton({ jobId }: { jobId: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const router = useRouter();

    const handleApply = async () => {
        setIsLoading(true);
        setStatus('idle');
        setMessage('');

        try {
            const result = await submitApplication(jobId);

            if (result.success) {
                setStatus('success');
                setMessage(result.message);
            } else {
                setStatus('error'); // e.g. duplicate
                setMessage(result.message);
            }

        } catch (error: any) {
            console.error(error);
            // Best guess check for auth error msg if it propagates
            if (error.message.includes("Must be logged in")) {
                router.push('/login');
                return;
            }
            setStatus('error');
            setMessage(error.message || "Failed to apply. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (status === 'success') {
        return (
            <Button disabled className="w-full bg-green-600 text-white font-bold py-6 text-lg opacity-100 cursor-not-allowed">
                ✅ Applied Successfully
            </Button>
        )
    }

    return (
        <div className="w-full space-y-2">
            <Button
                onClick={handleApply}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#009A44] to-[#F1B51C] hover:opacity-90 text-white font-bold py-6 text-lg transition-transform active:scale-95 disabled:scale-100 disabled:opacity-70"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Applying...
                    </>
                ) : (
                    "Apply Now"
                )}
            </Button>
            {message && <p className={`text-sm text-center font-medium ${status === 'error' ? 'text-red-500' : 'text-green-600'}`}>{message}</p>}
        </div>
    );
}