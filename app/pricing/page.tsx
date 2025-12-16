import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="relative bg-[#1a1a1a] text-white py-20 px-6 overflow-hidden">
                <div className="relative z-10 container mx-auto text-center max-w-3xl">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Simple, Transparent Pricing</h1>
                    <p className="text-xl text-gray-400 mb-8">
                        Choose the plan that fits your recruitment needs. No hidden fees.
                        Start hiring the best talent in Ethiopia today.
                    </p>
                </div>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#009A44]/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#FEDD00]/20 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2"></div>
            </div>

            <div className="container mx-auto px-6 -mt-10 mb-20">
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Starter Plan */}
                    <div className="bg-card border border-border rounded-2xl p-8 shadow-lg flex flex-col relative overflow-hidden">
                        <div className="mb-8">
                            <h3 className="text-lg font-medium text-muted-foreground uppercase tracking-wider mb-2">Starter</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold">Free</span>
                                <span className="text-muted-foreground">/forever</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-4">Perfect for small businesses hiring their first employees.</p>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            {[
                                "1 Active Job Posting",
                                "Basic Candidate Filtering",
                                "30 Days Listing Duration",
                                "Email Support"
                            ].map((feature, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <Check className="h-5 w-5 text-green-500 shrink-0" />
                                    <span className="text-sm">{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <Button variant="outline" className="w-full rounded-full" size="lg">Get Started</Button>
                    </div>

                    {/* Growth Plan (Popular) */}
                    <div className="bg-[#1a1a1a] text-white border-2 border-[#009A44] rounded-2xl p-8 shadow-2xl flex flex-col relative transform md:-translate-y-4">
                        <div className="absolute top-0 center w-full text-center bg-[#009A44] text-xs font-bold py-1 uppercase tracking-widest left-0">Most Popular</div>
                        <div className="mb-8 mt-4">
                            <h3 className="text-lg font-medium text-[#009A44] uppercase tracking-wider mb-2">Growth</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold">ETB 1,999</span>
                                <span className="text-gray-400">/month</span>
                            </div>
                            <p className="text-sm text-gray-400 mt-4">For growing companies with regular hiring needs.</p>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            {[
                                "10 Active Job Postings",
                                "Featured Listings (Top of Search)",
                                "Advanced Candidate Analytics",
                                "60 Days Listing Duration",
                                "Priority Support",
                                "Company Branding Page"
                            ].map((feature, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <Check className="h-5 w-5 text-[#009A44] shrink-0" />
                                    <span className="text-sm">{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <Button className="w-full bg-[#009A44] hover:bg-[#007A34] text-white rounded-full" size="lg">Choose Growth</Button>
                    </div>

                    {/* Enterprise Plan */}
                    <div className="bg-card border border-border rounded-2xl p-8 shadow-lg flex flex-col">
                        <div className="mb-8">
                            <h3 className="text-lg font-medium text-muted-foreground uppercase tracking-wider mb-2">Enterprise</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold">Custom</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-4">Maximum power for large scale recruitment.</p>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            {[
                                "Unlimited Job Postings",
                                "Dedicated Account Manager",
                                "API Access",
                                "ATS Integration",
                                "Custom Hiring Workflows",
                                "Bulk Import Tools"
                            ].map((feature, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <Check className="h-5 w-5 text-green-500 shrink-0" />
                                    <span className="text-sm">{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <Button variant="outline" className="w-full rounded-full" size="lg">Contact Sales</Button>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="mt-20 max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        <div className="bg-muted/30 p-6 rounded-lg">
                            <h4 className="font-bold mb-2">Can I cancel my subscription anytime?</h4>
                            <p className="text-muted-foreground text-sm">Yes, you can cancel your subscription at any time. Your posts will remain active until the billing cycle ends.</p>
                        </div>
                        <div className="bg-muted/30 p-6 rounded-lg">
                            <h4 className="font-bold mb-2">What payment methods do you accept?</h4>
                            <p className="text-muted-foreground text-sm">We accept all major credit cards, Telebirr, and direct bank transfers from Ethiopian banks.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
