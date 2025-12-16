'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client'; // Adjust path to your browser client
import { useRouter } from 'next/navigation';

interface Message {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
}

export default function ChatMessages({ conversationId, currentUserId }: { conversationId: string, currentUserId: string }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const supabase = createClient();
    const router = useRouter();
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new message
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        // 1. Fetch existing messages
        const fetchMessages = async () => {
            const { data } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true });
            if (data) setMessages(data);
        };

        fetchMessages();

        // 2. Subscribe to new messages
        const channel = supabase
            .channel(`convo-${conversationId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `conversation_id=eq.${conversationId}`
            }, (payload: any) => {
                setMessages((prev) => [...prev, payload.new as Message]);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [conversationId]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const { error } = await supabase.from('messages').insert({
            conversation_id: conversationId,
            sender_id: currentUserId,
            content: newMessage // 🛑 Ensure 'content' is the correct column name!
        });

        if (error) alert(error.message);
        else {
            setNewMessage('');
            router.refresh();
        }
    };

    return (
        <div className="flex flex-col h-[500px]">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50 rounded-t-lg">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${msg.sender_id === currentUserId
                            ? 'bg-indigo-600 text-white rounded-br-none'
                            : 'bg-white dark:bg-gray-800 dark:text-white border dark:border-gray-700 rounded-bl-none shadow-sm'
                            }`}>
                            <p className="text-sm">{msg.content}</p>
                        </div>
                    </div>
                ))}
                <div ref={scrollRef} />
            </div>

            <form onSubmit={sendMessage} className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800 flex gap-2 rounded-b-lg">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-100 dark:bg-gray-700 dark:text-white px-4 py-2 rounded-full outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-full font-medium hover:bg-indigo-700 transition">
                    Send
                </button>
            </form>
        </div>
    );
}