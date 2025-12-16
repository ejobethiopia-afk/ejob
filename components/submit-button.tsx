'use client';

import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';

export function SubmitButton({ text = 'Submit', loadingText = 'Submitting...' }: { text?: string, loadingText?: string }) {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {pending ? loadingText : text}
        </button>
    );
}
