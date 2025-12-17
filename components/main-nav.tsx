"use client";

import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";
import { Suspense } from "react";
import NotificationBell from "@/components/ui/NotificationBell";
import MessagingToggle from "@/components/Messaging/MessagingToggle";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Briefcase, Users, Building2, LayoutDashboard, Search, Bell, Upload, DollarSign } from "lucide-react";

export function MainNav() {
    return (
        <nav className="w-full sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
            <div className="container max-w-7xl mx-auto flex justify-between items-center h-16 px-4 md:px-6">
                <div className="flex gap-2 items-center font-bold text-xl">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#009A44] text-white">E</div>
                    <Link href={"/"}><span className="text-[#FFFF00]">Ejob</span> <span className="text-[#D6001C]">Ethiopia</span></Link>
                </div>

                <div className="hidden md:flex items-center gap-6">
                    <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
                        Home
                    </Link>

                    {/* Jobs Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary outline-none">
                            Jobs <ChevronDown className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-48">
                            <DropdownMenuItem>
                                <Link href="/jobs" className="flex items-center gap-2 w-full cursor-pointer">
                                    <Search className="h-4 w-4" /> Find Jobs
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Link href="/saved-jobs" className="flex items-center gap-2 w-full cursor-pointer">
                                    <Briefcase className="h-4 w-4" /> Saved Jobs
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Link href="/job-alerts" className="flex items-center gap-2 w-full cursor-pointer">
                                    <Bell className="h-4 w-4" /> Job Alerts
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Link href="/upload-cv" className="flex items-center gap-2 w-full cursor-pointer">
                                    <Upload className="h-4 w-4" /> Upload CV
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Employers Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary outline-none">
                            Employers <ChevronDown className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-48">
                            <DropdownMenuItem>
                                <Link href="/employers" className="flex items-center gap-2 w-full cursor-pointer">
                                    <Building2 className="h-4 w-4" /> Overview
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Link href="/dashboard/new" className="flex items-center gap-2 w-full cursor-pointer">
                                    <LayoutDashboard className="h-4 w-4" /> Post a Job
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Link href="/recruitment" className="flex items-center gap-2 w-full cursor-pointer">
                                    <Users className="h-4 w-4" /> Recruitment
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Link href="/pricing" className="flex items-center gap-2 w-full cursor-pointer">
                                    <DollarSign className="h-4 w-4" /> Pricing
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Link href="/companies" className="text-sm font-medium transition-colors hover:text-primary">
                        Companies
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <NotificationBell />
                    <MessagingToggle />
                    <Suspense fallback={<div className="h-9 w-20 bg-muted/50 rounded-md animate-pulse" />}>
                        <AuthButton />
                    </Suspense>
                    <ThemeSwitcher />
                </div>
            </div>
        </nav>
    );
}
