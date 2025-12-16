// app/dashboard/chat/[conversationId]/page.tsx

import { createActionClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import ChatMessages from '@/components/chat/ChatMessages';

/**
 * Props interface for Next.js 15 dynamic routes.
 * params and searchParams are now Promises.
 */
interface ChatPageProps {
    params: Promise<{
        conversationId: string;
    }>;
}

export default async function ChatRoomPage({ params }: ChatPageProps) {
    // 1. Next.js 15 fix: Unwrap params before accessing properties
    const { conversationId } = await params;

    // 2. Initialize Supabase client for Server Component
    const supabase = await createActionClient();

    // 3. Security: Ensure the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        redirect('/auth/signin');
    }

    // 4. Fetch conversation details
    // This verifies the conversation exists and checks access via RLS
    const { data: conversation, error: convoError } = await supabase
        .from('conversations')
        .select(`
      id,
      employer_id,
      seeker_id,
      created_at,
      employer:app_users!conversations_employer_id_fkey (full_name),
      seeker:app_users!conversations_seeker_id_fkey (full_name)
    `)
        .eq('id', conversationId)
        .single();

    // If the conversation doesn't exist or RLS blocks the user, show 404
    if (convoError || !conversation) {
        console.error("Chat Room Access Error:", convoError?.message);
        return notFound();
    }

    const isEmployer = conversation.employer_id === user.id;

    // Helper to handle Supabase relation replies which might be arrays or objects
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getFirst = (data: any) => Array.isArray(data) ? data[0] : data;

    const otherUser = isEmployer ? getFirst(conversation.seeker) : getFirst(conversation.employer);
    const displayName = otherUser?.full_name || (isEmployer ? 'Applicant' : 'Employer');

    return (
        <div className="container mx-auto max-w-3xl p-4 md:p-6 min-h-screen flex flex-col">
            {/* Header Section */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">{displayName}</h1>
                </div>
                <div className="text-sm text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">
                    Active Session
                </div>
            </div>

            {/* Main Chat Interface */}
            <div className="flex-1 bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
                <ChatMessages
                    conversationId={conversationId}
                    currentUserId={user.id}
                />
            </div>

            {/* Footer Info */}
            <p className="text-center text-xs text-gray-400 mt-4">
                End-to-end encrypted messaging secure session
            </p>
        </div>
    );
}