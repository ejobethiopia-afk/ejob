'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, CheckCircle2, Mail, MapPin, Search } from "lucide-react";
import { useState } from "react";

export default function JobAlertsPage() {
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitted(true);
        // Here you would integrate with your backend logic
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-6 py-12 md:py-20 max-w-6xl">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* Left Column: Content */}
                    <div className="space-y-8">
                        <div className="inline-flex items-center rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-sm font-medium text-yellow-600 dark:text-yellow-400">
                            <Bell className="w-4 h-4 mr-2" />
                            Never miss an opportunity
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                            Get your dream job delivered to your inbox.
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            Be the first to know when new jobs matching your criteria are posted.
                            Customize your alerts and stay ahead of the competition.
                        </p>

                        <div className="space-y-4">
                            {[
                                "Instant notifications for new listings",
                                "Customized to your skills and location",
                                "Weekly summaries of top opportunities",
                                "Completely free service"
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/30 text-[#009A44] flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                    <span className="font-medium">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Form Card */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#009A44] to-[#FEDD00] transform skew-y-3 rounded-3xl opacity-20 -z-10 blur-xl"></div>
                        <div className="bg-card border border-border rounded-2xl shadow-xl p-8">
                            {!isSubmitted ? (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="keywords">Keywords</Label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input id="keywords" placeholder="e.g. Software Engineer, Accountant" className="pl-10" required />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="location">Location</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input id="location" placeholder="e.g. Addis Ababa, Remote" className="pl-10" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Category</Label>
                                            <Select>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Any" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="tech">Technology</SelectItem>
                                                    <SelectItem value="finance">Finance</SelectItem>
                                                    <SelectItem value="health">Healthcare</SelectItem>
                                                    <SelectItem value="education">Education</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Frequency</Label>
                                            <Select defaultValue="daily">
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="daily">Daily</SelectItem>
                                                    <SelectItem value="weekly">Weekly</SelectItem>
                                                    <SelectItem value="instant">Instant</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input id="email" type="email" placeholder="you@example.com" className="pl-10" required />
                                        </div>
                                    </div>

                                    <Button type="submit" size="lg" className="w-full bg-[#009A44] hover:bg-[#007A34] text-white">
                                        Create Job Alert
                                    </Button>
                                    <p className="text-xs text-center text-muted-foreground mt-4">
                                        By clicking "Create Job Alert", you agree to our Terms of Service and Privacy Policy.
                                    </p>
                                </form>
                            ) : (
                                <div className="text-center py-12 space-y-6">
                                    <div className="h-20 w-20 bg-green-100 dark:bg-green-900/30 text-[#009A44] rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Bell className="h-10 w-10" />
                                    </div>
                                    <h3 className="text-2xl font-bold">Alert Created!</h3>
                                    <p className="text-muted-foreground">
                                        You successfully subscribed to job alerts. We'll send the best matches straight to your inbox.
                                    </p>
                                    <Button onClick={() => setIsSubmitted(false)} variant="outline">
                                        Create Another Alert
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
