import { createActionClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function ChatListPage() {
    const supabase = await createActionClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/auth/signin');

    // Fetch all conversations where the user is either the employer or the seeker
    const { data: conversations, error } = await supabase
        .from('conversations')
        .select(`
      id,
      created_at,
      employer_id,
      seeker_id,
      employer:app_users!conversations_employer_id_fkey (full_name),
      seeker:app_users!conversations_seeker_id_fkey (full_name)
    `)
        .or(`employer_id.eq.${user.id},seeker_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

    return (
        <div className="container mx-auto max-w-3xl p-6">
            <h1 className="text-3xl font-bold mb-8 dark:text-white">Messages</h1>

            <div className="space-y-4">
                {conversations?.map((convo: any) => {
                    const isEmployer = convo.employer_id === user.id;
                    const otherUser = isEmployer ? convo.seeker : convo.employer;
                    const displayName = otherUser?.full_name || (isEmployer ? 'Applicant' : 'Employer');

                    return (
                        <Link
                            key={convo.id}
                            href={`/dashboard/chat/${convo.id}`}
                            className="block p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 hover:border-indigo-500 transition-colors"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold dark:text-white">
                                        {displayName}
                                    </p>
                                </div>
                                <span className="text-xs text-gray-400">
                                    {new Date(convo.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </Link>
                    );
                })}

                {conversations?.length === 0 && (
                    <p className="text-center text-gray-500 mt-10">No conversations found yet.</p>
                )}
            </div>
        </div>
    );
}