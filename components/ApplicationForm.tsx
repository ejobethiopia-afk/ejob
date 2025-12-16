'use client';

import { useFormStatus } from 'react-dom';
import { useActionState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { submitApplicationWithForm } from '@/actions/job-actions';

interface ApplicationFormProps {
    jobId: string;
}

export default function ApplicationForm({ jobId }: ApplicationFormProps) {
    const { pending } = useFormStatus();
    const [state, formAction] = useActionState(submitApplicationWithForm, { 
        success: false, 
        message: '' 
    });

    useEffect(() => {
        if (state?.message) {
            alert(state.message);
            if (state.success) {
                window.location.reload();
            }
        }
    }, [state]);

    return (
        <form action={formAction} className="space-y-4">
            <input type="hidden" name="jobId" value={jobId} />
            <div>
                <label className="text-sm font-medium block">Upload CV (PDF/DOCX, max 5MB)</label>
                <input 
                    type="file" 
                    name="cv" 
                    accept=".pdf,.doc,.docx" 
                    required 
                    className="mt-1 w-full p-2 border rounded-md bg-background text-foreground"
                    disabled={pending}
                />
            </div>
            <div>
                <label className="text-sm font-medium block">Cover Letter</label>
                <textarea 
                    name="cover_letter_content" 
                    rows={4} 
                    className="w-full p-2 border rounded-md bg-background text-foreground"
                    disabled={pending}
                />
            </div>
            <div>
                <button 
                    type="submit" 
                    disabled={pending}
                    className="w-full py-3 bg-gradient-to-r from-[#009A44] to-[#F1B51C] text-white font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {pending ? 'Submitting...' : 'Apply with CV'}
                </button>
            </div>
        </form>
    );
}
