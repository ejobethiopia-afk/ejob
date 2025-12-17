"use client";

import { usePathname } from "next/navigation";
import { MainNav } from "@/components/main-nav";
import { SiteFooter } from "@/components/site-footer";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";
import { Suspense } from "react";

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Check if current page is an auth page
    const isAuthPage = pathname?.startsWith('/login') ||
        pathname?.startsWith('/sign-up') ||
        pathname?.startsWith('/forgot-password') ||
        pathname?.startsWith('/update-password') ||
        pathname?.startsWith('/sign-up-success');

    return (
        <>
            {isAuthPage ? (
                // Simplified header for auth pages - only logo, auth buttons, and theme switcher
                <nav className="w-full sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
                    <div className="container max-w-7xl mx-auto flex justify-between items-center h-16 px-4 md:px-6">
                        <div className="flex gap-2 items-center font-bold text-xl">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#009A44] text-white">E</div>
                            <Link href="/"><span className="text-[#FFFF00]">Ejob</span> <span className="text-[#D6001C]">Ethiopia</span></Link>
                        </div>

                        <div className="flex items-center gap-4">
                            <Suspense fallback={<div className="h-9 w-20 bg-muted/50 rounded-md animate-pulse" />}>
                                <AuthButton />
                            </Suspense>
                            <ThemeSwitcher />
                        </div>
                    </div>
                </nav>
            ) : (
                // Full navigation for non-auth pages
                <MainNav />
            )}

            <main className="flex-1 flex flex-col">
                {children}
            </main>

            {!isAuthPage && <SiteFooter />}
        </>
    );
}
