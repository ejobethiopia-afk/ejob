import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";
import { Suspense } from "react";
import NotificationBell from "@/components/ui/NotificationBell";
import MessagingToggle from "@/components/Messaging/MessagingToggle";

export function MainNav() {
    return (
        <nav className="w-full sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
            <div className="container max-w-7xl mx-auto flex justify-between items-center h-16 px-4 md:px-6">
                <div className="flex gap-2 items-center font-bold text-xl">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#009A44] text-white">E</div>
                    <Link href={"/"}><span className="text-[#FFFF00]">Ejob</span> <span className="text-[#D6001C]">Ethiopia</span></Link>
                </div>
                <div className="flex items-center gap-4">
                    <NotificationBell />
                    <MessagingToggle />
                    <Suspense>
                        <AuthButton />
                    </Suspense>
                    <ThemeSwitcher />
                </div>
            </div>
        </nav>
    );
}
