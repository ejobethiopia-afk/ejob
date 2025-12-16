// components/Messaging/MessagingToggle.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
// Assuming 'lucide-react' MessageSquare is what you want for the icon
import { MessageSquare } from 'lucide-react';
import ConversationListClient from './ConversationListClient'; // Assume this file exists

/**
 * Toggles a dropdown for site-wide messaging/notifications.
 */
export default function MessagingToggle() {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const ref = useRef<HTMLDivElement | null>(null);

    // --- Authentication and User State ---
    useEffect(() => {
        const supabase = createClient();
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        init();

        // Adding ': any' tells TypeScript to stop worrying about the type of this parameter
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    // --- Fetch Unread Message Notifications ---
    useEffect(() => {
        if (!user) return;

        const supabase = createClient();

        const fetchUnread = async () => {
            const { data } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .eq('is_read', false);

            if (data) {
                // Filter for message/chat related notifications
                const messages = data.filter((n: any) => {
                    const msg = (n.message || "").toLowerCase();
                    const url = (n.link_url || "").toLowerCase();
                    return msg.includes('message') || msg.includes('chat') || url.includes('/messages') || url.includes('/chat');
                });
                setUnreadCount(messages.length);
            }
        };

        fetchUnread();

        // Subscribe to realtime updates
        const channel = supabase
            .channel('message_badge_channel')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
                () => fetchUnread()
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [user]);

    // --- Outside Click Handler (from MessageIcon) ---
    useEffect(() => {
        function onDoc(e: MouseEvent) {
            if (!ref.current) return;
            // Close if click is outside the dropdown container
            if (!ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', onDoc);
        return () => document.removeEventListener('mousedown', onDoc);
    }, []);

    if (!user) {
        // Only show the messaging icon if the user is authenticated
        return null;
    }

    const markMessagesAsRead = async () => {
        if (!user || unreadCount === 0) return;

        // Optimistic update
        setUnreadCount(0);

        // Update DB: mark all message-related notifications as read for this user
        // Note: Ideally we'd filter strictly by ID, but for "mark all messages read" 
        // we can attempt a broader update or just rely on the user clicking individual items later?
        // Actually, the request says "when notified number... be gone", implying "mark all seen".
        // A safe way is to fetch the unread IDs locally (which we don't have stored in state fully) 
        // OR just rely on the user having "seen" them by opening the menu.
        // Let's do a best-effort update for now based on the same filter logic, 
        // OR simpler: just clear the badge visually until next fetch?
        // User asked: "notified number and alert should be gone". 
        // Let's update all unread notifications that look like messages.

        const supabase = createClient();

        // We need to find them first to update them safely, or specific RPCR?
        // For simplicity and performance, let's fetch IDs first then update.
        const { data } = await supabase
            .from('notifications')
            .select('id, message, link_url')
            .eq('user_id', user.id)
            .eq('is_read', false); // Only unread

        if (data && data.length > 0) {
            const messageIds = data.filter((n: any) => {
                const msg = (n.message || "").toLowerCase();
                const url = (n.link_url || "").toLowerCase();
                return msg.includes('message') || msg.includes('chat') || url.includes('/messages') || url.includes('/chat');
            }).map((n: any) => n.id);

            if (messageIds.length > 0) {
                await supabase
                    .from('notifications')
                    .update({ is_read: true })
                    .in('id', messageIds);
            }
        }
    };

    const toggleMessaging = () => {
        if (!isOpen) {
            markMessagesAsRead();
        }
        setIsOpen(s => !s);
    };

    return (
        <div className="relative inline-block" ref={ref}>
            <button
                onClick={toggleMessaging}
                aria-label="Toggle Messages"
                // 🛑 Dark Mode Fix: Updated hover and text colors
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
                {/* Use the Lucide icon from your original MessagingToggle */}
                <MessageSquare className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex items-center justify-center h-4 w-4 text-[10px] font-bold text-white bg-red-600 rounded-full border-2 border-background">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Container */}
            {isOpen && (
                <div
                    // 🛑 Dark Mode Fix: Updated background, border, and shadow colors
                    className="absolute right-0 mt-2 w-80 
                               bg-white dark:bg-gray-800 
                               border border-gray-200 dark:border-gray-700 
                               rounded-lg shadow-xl z-50"
                >
                    {/* Placeholder for conversation list */}
                    <div className="p-4 text-center dark:text-white border-b dark:border-gray-700">
                        Messages ({user.email})
                    </div>
                    <ConversationListClient />
                </div>
            )}
        </div>
    );
}