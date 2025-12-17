import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, BarChart3, Users, Zap } from "lucide-react";

export default function EmployersPage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative py-20 lg:py-32 bg-gray-50 dark:bg-zinc-900 border-b">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="flex flex-col items-center text-center space-y-8">
                        <div className="space-y-4 max-w-3xl">
                            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-[#009A44] via-[#FEDD00] to-[#D6001C]">
                                Hire the Best Talent in Ethiopia
                            </h1>
                            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                                Connect with thousands of qualified professionals. Post jobs, manage candidates, and streamline your recruitment process with Ejob Ethiopia.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button asChild size="lg" className="bg-[#009A44] hover:bg-[#007A35] text-white">
                                <Link href="/dashboard/new">Post a Job Now</Link>
                            </Button>
                            <Button asChild variant="outline" size="lg">
                                <Link href="/pricing">View Pricing</Link>
                            </Button>
                        </div>
                    </div>
                </div>
                {/* Background Pattern */}
                <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-zinc-950 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white dark:bg-zinc-950">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
                            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20 text-[#009A44]">
                                <Zap className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold">Fast Posting</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Create and publish your job listings in minutes with our intuitive editor.
                            </p>
                        </div>
                        <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
                            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/20 text-[#bda400]">
                                <Users className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold">Quality Candidates</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Access a diverse pool of skilled professionals across various industries.
                            </p>
                        </div>
                        <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
                            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/20 text-[#D6001C]">
                                <BarChart3 className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold">Analytics</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Track views, clicks, and applications to optimize your recruitment strategy.
                            </p>
                        </div>
                        <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
                            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold">Verified Profiles</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Review detailed candidate profiles with verified skills and experience.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-[#1a1a1a] text-white">
                <div className="container px-4 md:px-6 mx-auto text-center">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-6">
                        Ready to Build Your Dream Team?
                    </h2>
                    <p className="mx-auto max-w-[600px] text-gray-400 mb-8 text-lg">
                        Join thousands of top companies using Ejob Ethiopia to find the best talent.
                    </p>
                    <Button asChild size="lg" className="bg-[#009A44] hover:bg-[#007A35] text-white text-lg px-8">
                        <Link href="/sign-up?type=employer">Get Started Today</Link>
                    </Button>
                </div>
            </section>
        </div>
    );
}
