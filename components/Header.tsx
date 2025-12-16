'use client';
// ... other imports
import MessagingToggle from '@/components/Messaging/MessagingToggle';

export default function Header() {
    // ... header content
    return (
        <header>
            {/* ... other navbar items */}
            <div className="flex items-center space-x-4">
                <MessagingToggle />
                {/* ... profile avatar, etc. */}
            </div>
        </header>
    );
}