// components/Messaging/ConversationList.tsx
import Link from 'next/link';
import { getConversations } from '@/lib/data/conversations';

export default async function ConversationList() {
    const convos = await getConversations();

    if (!convos || convos.length === 0) {
        return <div className="text-muted-foreground p-4">No active conversations.</div>;
    }

    return (
        <div className="w-72 bg-card border border-border rounded-md p-2">
            <h3 className="font-semibold mb-2">Messages</h3>
            <ul className="space-y-2">
                {convos.map((c: any) => {
                    const otherName = c.other_user?.full_name || 'Unknown User';
                    return (
                        <li key={c.id} className="p-2 rounded hover:bg-muted">
                            <Link href={`/conversations/${c.id}`} className="block">
                                <div className="text-sm font-medium">{otherName}</div>
                                <div className="text-xs text-foreground/60">{c.job_id ? `Job: ${c.job_id}` : ''} {c.updated_at ? new Date(c.updated_at).toLocaleString() : ''}</div>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
