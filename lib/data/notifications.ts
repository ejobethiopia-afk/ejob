// lib/data/notifications.ts
import { createClient } from '@/lib/supabase/server';

// Define a type for your notification data for better clarity
export interface Notification {
  id: number;
  user_id: string;
  message: string;
  link_url: string | null;
  is_read: boolean;
  created_at: string;
}

/**
 * Returns the number of unread notifications for the currently-authenticated user.
 * Safe to call from Server Components / Server Actions.
 */
export async function getUnreadNotificationCount(): Promise<number> {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return 0;

  const userId = userData.user.id;

  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) {
    console.error('getUnreadNotificationCount error:', error);
    return 0;
  }

  return typeof count === 'number' ? count : 0;
}

/**
 * Create a notification for a user. Non-fatal — logs errors but does not throw.
 */
export async function createNotification(userId: string, message: string, linkUrl?: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      message,
      link_url: linkUrl ?? null,
    });

  if (error) {
    console.error('Failed to create notification for user:', userId, error);
  }
}

/**
 * Fetch recent notifications for the current user (top N, newest first)
 */
export async function getRecentNotifications(limit = 20): Promise<Notification[]> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return [];

  const userId = userData.user.id;

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('getRecentNotifications error:', error);
    return [];
  }

  return (data || []) as Notification[];
}


