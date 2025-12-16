import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, FileText, Search, Shield } from "lucide-react";

export default function UploadCVPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-[#009A44]/5 py-24 sm:py-32">
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <div className="inline-flex items-center rounded-full border border-[#009A44]/30 bg-[#009A44]/10 px-3 py-1 text-sm font-medium text-[#009A44] mb-6">
                        <span className="flex h-2 w-2 rounded-full bg-[#009A44] mr-2"></span>
                        Join 50,000+ Professionals
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                        Upload Your CV and <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#009A44] to-[#FEDD00]">Get Discovered</span>
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                        Top employers in Ethiopia are looking for talent like you. Upload your CV today and let your dream job come to you.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" className="bg-[#009A44] hover:bg-[#007A34] text-white text-lg h-12 px-8" asChild>
                            <Link href="/profile">
                                Upload CV Now <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" className="text-lg h-12 px-8" asChild>
                            <Link href="/jobs">
                                Browse Jobs
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Decorative blobs */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-[#FEDD00]/10 to-transparent blur-3xl -z-10 rounded-full opacity-50" />
            </div>

            {/* Benefits Section */}
            <div className="py-24 bg-card">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Why Upload Your CV?</h2>
                        <p className="text-muted-foreground">Maximize your chances of getting hired with our smart functionality.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Card 1 */}
                        <div className="bg-background p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all group">
                            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Search className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Get Discovered</h3>
                            <p className="text-muted-foreground">
                                Make your profile visible to top recruiters who search our database daily for skilled candidates.
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-background p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all group">
                            <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <FileText className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Easy Applications</h3>
                            <p className="text-muted-foreground">
                                Apply to jobs with a single click. No need to re-enter your details for every application.
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-background p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all group">
                            <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Shield className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Privacy Control</h3>
                            <p className="text-muted-foreground">
                                You decide who sees your contact info. Keep your job search confidential if needed.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Testimonial / Social Proof */}
            <div className="py-24 bg-muted/30">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto bg-background rounded-2xl p-8 md:p-12 shadow-sm border border-border relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <svg width="100" height="80" viewBox="0 0 100 80" fill="currentColor">
                                <path d="M28.0 0.0 C12.5 0.0 0.0 12.5 0.0 28.0 C0.0 43.5 12.5 56.0 28.0 56.0 C28.0 68.5 20.0 78.0 4.0 80.0 L0.0 80.0 L0.0 40.0 C0.0 32.5 2.0 22.0 10.0 22.0 L32.0 22.0 L32.0 0.0 L28.0 0.0 Z M88.0 0.0 C72.5 0.0 60.0 12.5 60.0 28.0 C60.0 43.5 72.5 56.0 88.0 56.0 C88.0 68.5 80.0 78.0 64.0 80.0 L60.0 80.0 L60.0 40.0 C60.0 32.5 62.0 22.0 70.0 22.0 L92.0 22.0 L92.0 0.0 L88.0 0.0 Z" />
                            </svg>
                        </div>
                        <div className="relative z-10">
                            <p className="text-xl md:text-2xl font-medium italic mb-6">"I uploaded my CV on Monday and had three interview requests by Wednesday. Ejob Ethiopia connects you with real opportunities."</p>
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-500">
                                    BK
                                </div>
                                <div>
                                    <h4 className="font-bold">Bereket Kebede</h4>
                                    <p className="text-sm text-muted-foreground">Software Engineer at TechCorp</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="py-12 bg-background border-t border-border">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-2xl font-bold mb-4">Ready to advance your career?</h2>
                    <Button size="lg" className="bg-[#009A44] hover:bg-[#007A34] text-white rounded-full px-8">
                        <Link href="/dashboard/profile">Create Your Profile</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
