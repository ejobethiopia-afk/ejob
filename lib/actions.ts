// lib/actions.ts

"use server";

import { createActionClient } from '@/lib/supabase/server';

const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    return 'An unknown error occurred.';
};

export async function initiateChat(applicantId: string) {
    const supabase = await createActionClient();
    const { data: { user: employer }, error: authError } = await supabase.auth.getUser();

    if (authError || !employer) {
        return { success: false, error: "Authentication required to start chat." };
    }

    try {
        // 1. Check if a conversation already exists
        // Using your actual columns: employer_id and seeker_id
        const { data: existingConvo } = await supabase
            .from('conversations')
            .select('id')
            .or(`and(employer_id.eq.${employer.id},seeker_id.eq.${applicantId}),and(employer_id.eq.${applicantId},seeker_id.eq.${employer.id})`)
            .maybeSingle();

        if (existingConvo) {
            return { success: true, conversationId: existingConvo.id };
        }

        // 2. Insert new conversation using employer_id and seeker_id
        const { data: newConvo, error: insertError } = await supabase
            .from('conversations')
            .insert({
                employer_id: employer.id,
                seeker_id: applicantId,
                // job_id is also in your table, you can add it here if needed:
                // job_id: some_job_id 
            })
            .select('id')
            .maybeSingle();

        if (insertError) {
            console.error('Database Error creating conversation:', insertError);
            throw new Error(`Failed to create chat room: ${insertError.message}`);
        }

        if (!newConvo) {
            throw new Error("Could not create new conversation record.");
        }

        return { success: true, conversationId: newConvo.id };

    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error) };
    }
}

// Wrapper for the Client Component
export async function messageApplicantAction(formData: FormData) {
    const applicantId = formData.get('applicantId') as string;
    if (!applicantId) return { success: false, error: "Missing applicant ID." };
    return initiateChat(applicantId);
}