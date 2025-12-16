// lib/data/conversations.ts
import { createClient } from '@/lib/supabase/server';

export type ConversationRow = any;

export async function getConversations(): Promise<ConversationRow[]> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return [];

  const userId = userData.user.id;

  const { data, error } = await supabase
    .from('conversations')
    .select(`*, employer:employer_id (full_name), seeker:seeker_id (full_name)`)
    .or(`employer_id.eq.${userId},seeker_id.eq.${userId}`)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }

  // Map to include other_user for convenience
  const mapped = (data || []).map((convo: any) => {
    const otherId = convo.employer_id === userId ? convo.seeker_id : convo.employer_id;
    const other = convo.employer_id === userId ? convo.seeker : convo.employer;
    return { ...convo, other_user: other, other_id: otherId };
  });

  return mapped;
}
