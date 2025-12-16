// src/components/applicant/MessageButton.tsx

'use client';

import React, { useTransition, useRef } from 'react'; // 🛑 Import useRef
import { useRouter } from 'next/navigation';

interface ChatActionResponse {
    success: boolean;
    error?: string;
    conversationId?: string;
}

interface MessageButtonProps {
    applicantName: string;
    // 🛑 The action now takes FormData (the standard for Server Action forms)
    actionToRun: (formData: FormData) => Promise<ChatActionResponse>;
    applicantId: string; // 🛑 New prop to pass the ID
}

export default function MessageButton({ applicantName, actionToRun, applicantId }: MessageButtonProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    // 🛑 Use a ref to hold the form data
    const formRef = useRef<HTMLFormElement>(null);

    const handleClick = () => {
        startTransition(async () => {
            // 🛑 Create FormData object using the ref
            const formData = new FormData(formRef.current!);

            const result = await actionToRun(formData); // 🛑 Pass FormData to the action

            if (result.success && result.conversationId) {
                router.push(`/dashboard/chat/${result.conversationId}`);
            } else {
                alert(`Failed to start chat: ${result.error || 'Unknown error'}`);
            }
        });
    };

    return (
        // 🛑 Wrap the button in a form to submit the necessary ID
        <form ref={formRef}>
            {/* Hidden field to pass the dynamic ID (applicantId) */}
            <input type="hidden" name="applicantId" value={applicantId} />

            <button
                type="submit" // 🛑 Change to submit
                onClick={(e) => {
                    e.preventDefault(); // Prevent default browser form submission
                    handleClick(); // Use our handler
                }}
                disabled={isPending}
                className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-300 disabled:bg-indigo-400"
            >
                {isPending ? 'Starting Chat...' : 'Send Message'}
            </button>
        </form>
    );
}