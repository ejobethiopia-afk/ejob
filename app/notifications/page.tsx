import { getRecentNotifications, Notification } from '@/lib/data/notifications';
import Link from 'next/link';

export default async function NotificationsPage() {
    const notifications = await getRecentNotifications(100); // Fetch up to 100 recent notifications

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">All Notifications</h1>
            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <p className="text-gray-500">You currently have no notifications.</p>
                ) : (
                    notifications.map((n: Notification) => (
                        <Link 
                            key={n.id}
                            href={n.link_url || '#'} 
                            className={`block p-4 rounded-lg shadow-sm transition-all ${
                                n.is_read ? 'bg-white hover:bg-gray-50' : 'bg-blue-50 hover:bg-blue-100 border border-blue-200'
                            }`}
                        >
                            <p className={`font-medium ${n.is_read ? 'text-gray-700' : 'text-blue-800'}`}>{n.message}</p>
                            <p className="text-xs text-gray-400 mt-1">
                                {new Date(n.created_at).toLocaleString()}
                            </p>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
