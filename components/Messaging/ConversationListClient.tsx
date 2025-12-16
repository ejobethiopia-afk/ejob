'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ConversationListClient() {
  const [convos, setConvos] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreadConvos, setUnreadConvos] = useState<Set<string>>(new Set());

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          if (mounted) {
            setConvos([]);
            setLoading(false);
          }
          return;
        }

        const userId = user.id;

        // Fetch conversations
        const { data, error } = await supabase
          .from('conversations')
          .select(`
            *,
            employer:app_users!conversations_employer_id_fkey (full_name),
            seeker:app_users!conversations_seeker_id_fkey (full_name)
          `)
          .or(`employer_id.eq.${userId},seeker_id.eq.${userId}`)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Supabase Error:', error.message, error.details, error.hint);
          if (mounted) setConvos([]);
        } else {
          const mapped = (data || []).map((convo: any) => {
            const isEmployer = convo.employer_id === userId;
            const otherUser = isEmployer ? convo.seeker : convo.employer;
            const otherId = isEmployer ? convo.seeker_id : convo.employer_id;

            return {
              ...convo,
              other_user: otherUser,
              other_id: otherId
            };
          });
          if (mounted) setConvos(mapped);
        }

        // Fetch unread notifications to mark conversations as unread
        const { data: unreadData } = await supabase
          .from('notifications')
          .select('link_url')
          .eq('user_id', userId)
          .eq('is_read', false)
          .like('link_url', '%/dashboard/chat/%');

        if (unreadData && mounted) {
          const ids = new Set<string>();
          unreadData.forEach((n: any) => {
            // Extract UUID from /dashboard/chat/[uuid]
            const parts = n.link_url?.split('/');
            const id = parts?.[parts.length - 1];
            if (id) ids.add(id);
          });
          setUnreadConvos(ids);
        }

      } catch (err) {
        console.error('ConversationListClient load error:', err);
        if (mounted) setConvos([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    // Subscribe to new messages to auto-refresh the list
    const channel = supabase
      .channel('conversation_list_updates')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => {
          // Re-load to get updated "last message" or order
          load();
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) return <div className="p-4 text-sm animate-pulse">Loading conversations...</div>;
  if (!convos || convos.length === 0) return <div className="text-muted-foreground p-4 text-sm">No messages yet.</div>;

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-lg p-3">
      <h3 className="font-bold text-lg mb-3 px-2 dark:text-white border-b pb-2 dark:border-gray-700">Messages</h3>
      <ul className="space-y-1">
        {convos.map((c: any) => {
          const otherName = c.other_user?.full_name || 'User';
          const isUnread = unreadConvos.has(c.id);

          return (
            <li key={c.id} className="group">
              <Link
                href={`/dashboard/chat/${c.id}`}
                className={`block p-3 rounded-md transition-all ${isUnread
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 shadow-sm'
                  : 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                  }`}
              >
                <div className="flex justify-between items-start">
                  <div className={`text-sm ${isUnread ? 'font-bold text-gray-900 dark:text-white' : 'font-semibold dark:text-gray-200'} group-hover:text-indigo-600 dark:group-hover:text-indigo-400`}>
                    {otherName}
                  </div>
                  {isUnread && <span className="h-2 w-2 rounded-full bg-blue-500"></span>}
                </div>
                <div className={`text-[10px] mt-1 flex justify-between ${isUnread ? 'text-gray-600 dark:text-gray-300 font-medium' : 'text-gray-500'}`}>
                  <span>Conversation Started</span>
                  <span>{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="border-t dark:border-gray-700 mt-2 pt-2 text-center">
        <Link
          href="/dashboard/chat"
          className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline block py-1"
        >
          View all messages
        </Link>
      </div>
    </div >
  );
}