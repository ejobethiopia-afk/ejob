"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
// Import the Server Action to mark notifications as read
import { markNotificationRead } from "@/actions/notification-actions";

// Define the notification type for better type safety
interface NotificationItem {
    id: string; // Assuming UUID or string for ID
    user_id: string;
    message: string;
    link_url: string | null;
    is_read: boolean;
    created_at: string;
}

export default function NotificationsList({ userId }: { userId: string }) {
    const supabase = createClient();
    const [items, setItems] = useState<NotificationItem[]>([]);

    const fetchNotifications = async () => {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) {
            console.error('Failed to fetch notifications:', error);
            return;
        }
        if (data) setItems(data as NotificationItem[]);
    };

    // Handler to mark a notification as read and update the UI
    const markReadHandler = async (id: string) => {
        // 1. Optimistically update the UI state
        setItems(prevItems =>
            prevItems.map(item =>
                item.id === id ? { ...item, is_read: true } : item
            )
        );

        // 2. Call the Server Action for persistence
        const result = await markNotificationRead(id);

        if (result.error) {
            console.error("Failed to mark read on server:", result.error);
            // Revert optimistic update if server fails
            setItems(prevItems =>
                prevItems.map(item =>
                    item.id === id ? { ...item, is_read: false } : item
                )
            );
        }
    };


    useEffect(() => {
        if (!userId) return;

        // Initial fetch
        fetchNotifications();

        // 🚨 FIX: Correct Supabase Realtime subscription
        const sub = supabase.channel('notification_list_channel')
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen for INSERT, UPDATE, DELETE
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`
                },
                // Refetch all data on any change for simplicity and robustness
                () => {
                    fetchNotifications();
                }
            ).subscribe();

        // Cleanup function
        return () => {
            supabase.removeChannel(sub);
        };
    }, [userId, supabase]);

    return (
        <div className="space-y-4">
            {items.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground">
                    No notifications
                </div>
            )}

            {items.map((it) => (
                <div
                    key={it.id}
                    className={`p-4 border rounded-xl transition-all hover:shadow-md ${it.is_read ? 'bg-card text-muted-foreground border-border' : 'bg-primary/5 border-primary/20 shadow-sm'}`}
                >
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                            <p className={`text-sm leading-relaxed ${!it.is_read ? 'font-semibold text-foreground' : ''}`}>{it.message}</p>
                            {it.link_url && (
                                <a
                                    href={it.link_url}
                                    className="inline-block mt-2 text-xs font-medium text-primary hover:underline"
                                    onClick={() => !it.is_read && markReadHandler(it.id)}
                                >
                                    View details
                                </a>
                            )}
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                            {!it.is_read && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => markReadHandler(it.id)}
                                >
                                    Mark read
                                </Button>
                            )}
                        </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                        {new Date(it.created_at).toLocaleString()}
                    </div>
                </div>
            ))}
        </div>
    );
}