"use client";
import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export default function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const ref = useRef<HTMLDivElement | null>(null);
    const supabase = createClient();

    const load = useCallback(async () => {
        setLoading(true);
        try {
            // Using your existing API endpoint
            const res = await fetch('/api/notifications/recent');
            if (res.ok) {
                const data = await res.json();

                // 🛑 STRICT FILTER: Hides anything related to "message" or "chat"
                // Adjust these strings based on what your message notifications actually say
                const systemOnly = data.filter((n: any) => {
                    const msg = n.message?.toLowerCase() || "";
                    const url = n.link_url?.toLowerCase() || "";

                    const isChat = msg.includes('message') ||
                        msg.includes('chat') ||
                        url.includes('/messages') ||
                        url.includes('/chat');

                    return !isChat;
                });

                setNotifications(systemOnly || []);
            }
        } catch (err) {
            console.error('Failed to load notifications', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const markAsRead = async (id: string) => {
        // Optimistically update
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, is_read: true } : n
        ));

        // Send to server
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id);
    };

    const markAllAsRead = useCallback(async () => {
        if (!user) return;

        // Optimistically update UI state immediately
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));

        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false);
    }, [user, supabase]);

    useEffect(() => {
        function onDoc(e: MouseEvent) {
            if (!ref.current?.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', onDoc);
        return () => document.removeEventListener('mousedown', onDoc);
    }, []);

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        init();
    }, []);

    useEffect(() => {
        if (!user) return;
        load();
        const channel = supabase
            .channel('bell_realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
                () => load())
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [user, load, supabase]);



    const unreadCount = notifications.filter(n => !n.is_read).length;

    if (!user) return null;

    return (
        <div className="relative inline-block" ref={ref}>
            <button
                onClick={() => setOpen(s => !s)}
                className="relative p-2 rounded-full hover:bg-secondary/50 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex items-center justify-center h-5 w-5 text-[10px] font-bold text-white bg-destructive rounded-full ring-2 ring-background">
                        {unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-80 bg-popover border border-border rounded-lg shadow-xl z-50 overflow-hidden">
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-3 border-b pb-2">
                            <h3 className="font-bold text-sm">System Alerts</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => markAllAsRead()}
                                    className="text-[10px] text-muted-foreground hover:text-foreground underline"
                                >
                                    Mark all read
                                </button>
                                <Link href="/dashboard/notifications" className="text-xs text-primary font-medium hover:underline">View all</Link>
                            </div>
                        </div>

                        <div className="max-h-80 overflow-y-auto space-y-2">
                            {notifications.length === 0 ? (
                                <div className="text-xs text-center py-4 text-muted-foreground">No alerts</div>
                            ) : (
                                notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        onClick={() => {
                                            if (!n.is_read) markAsRead(n.id);
                                            setOpen(false);
                                        }}
                                        className={`p-3 rounded-md border transition-all cursor-pointer ${
                                            // 🛑 CSS FIX: Using theme-aware colors (Primary/Secondary)
                                            !n.is_read
                                                ? 'bg-blue-50/50 border-blue-200 shadow-sm'
                                                : 'bg-transparent border-transparent opacity-60'
                                            }`}
                                    >
                                        <Link href={n.link_url || '#'} className="block">
                                            <div className={`text-sm leading-tight ${
                                                // 🛑 TEXT BOLD FIX
                                                !n.is_read ? 'font-bold text-slate-800' : 'font-normal text-slate-500'
                                                }`}>
                                                {n.message}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground mt-1 font-mono">
                                                {new Date(n.created_at).toLocaleTimeString()}
                                            </div>
                                        </Link>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}