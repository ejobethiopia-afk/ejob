"use server";

import { createActionClient } from "@/lib/supabase/server";

export async function startConversationAction(seekerId: string, employerId: string, jobId?: string) {
    const supabase = await createActionClient();

    // Check if conversation exists
    const { data: existing } = await supabase.from('conversations').select('*').match({ seeker_id: seekerId, employer_id: employerId, job_id: jobId || null }).limit(1);
    if (existing && existing.length > 0) {
        return { conversation: existing[0] };
    }

    const { data, error } = await supabase.from('conversations').insert({ seeker_id: seekerId, employer_id: employerId, job_id: jobId || null }).select().single();
    if (error) {
        console.error('Failed to start conversation', error);
        return { error: error.message };
    }
    return { conversation: data };
}

export async function sendMessageAction(conversationId: string, senderId: string, content: string) {
    const supabase = await createActionClient();
    if (!content || content.trim().length === 0) return { error: 'Message empty' };

    const { data, error } = await supabase.from('messages').insert({ conversation_id: conversationId, sender_id: senderId, content }).select().single();
    if (error) {
        console.error('Failed to send message', error);
        return { error: error.message };
    }
    return { message: data };
}

export async function getConversationsForUser(userId: string) {
    const supabase = await createActionClient();
    const { data, error } = await supabase.from('conversations').select('*').or(`employer_id.eq.${userId},seeker_id.eq.${userId}`).order('created_at', { ascending: false });
    if (error) {
        console.error('Failed to fetch conversations', error);
        return { error: error.message };
    }
    return { data };
}
