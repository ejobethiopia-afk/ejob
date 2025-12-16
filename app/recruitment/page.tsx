'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Briefcase, Building2, Users } from "lucide-react";

export default function RecruitmentSolutionsPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero */}
            <div className="relative bg-slate-900 text-white py-24 px-6">
                <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
                            Strategic Recruitment Solutions for <span className="text-[#009A44]">Modern Enterprises</span>
                        </h1>
                        <p className="text-lg text-slate-300 mb-8 max-w-lg">
                            We don't just fill seats. We partner with you to build high-performance teams that drive your business forward.
                        </p>
                        <Button size="lg" className="bg-[#009A44] hover:bg-[#007A34] text-white px-8 h-12 text-lg">
                            Partner With Us
                        </Button>
                    </div>
                    <div className="hidden md:block">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/10 backdrop-blur p-6 rounded-2xl border border-white/20 transform translate-y-8">
                                <Users className="h-10 w-10 text-[#FEDD00] mb-4" />
                                <div className="text-4xl font-bold mb-1">50k+</div>
                                <div className="text-sm text-slate-400">Candidate Database</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur p-6 rounded-2xl border border-white/20">
                                <Briefcase className="h-10 w-10 text-[#009A44] mb-4" />
                                <div className="text-4xl font-bold mb-1">98%</div>
                                <div className="text-sm text-slate-400">Placement Success</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur p-6 rounded-2xl border border-white/20 col-span-2 mt-4">
                                <Building2 className="h-10 w-10 text-blue-400 mb-4" />
                                <div className="text-xl font-bold mb-2">Trusted by Industry Leaders</div>
                                <div className="flex gap-4 opacity-50">
                                    <div className="h-8 w-20 bg-white/20 rounded"></div>
                                    <div className="h-8 w-20 bg-white/20 rounded"></div>
                                    <div className="h-8 w-20 bg-white/20 rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Services */}
            <div className="py-24 container mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold mb-4">Comprehensive HR Solutions</h2>
                    <p className="text-muted-foreground">From executive search to mass recruitment, we have the expertise to handle your most complex hiring challenges.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mb-24">
                    <div className="bg-card p-8 rounded-xl border border-border shadow-sm">
                        <h3 className="text-xl font-bold mb-4">Executive Search</h3>
                        <p className="text-muted-foreground mb-6">
                            Targeted headhunting for C-suite and senior management roles. We identify and engage passive candidates who fit your culture.
                        </p>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#009A44]"></div> Confidential process</li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#009A44]"></div> In-depth vetting</li>
                        </ul>
                    </div>

                    <div className="bg-card p-8 rounded-xl border border-border shadow-sm">
                        <h3 className="text-xl font-bold mb-4">Mass Recruitment</h3>
                        <p className="text-muted-foreground mb-6">
                            Scalable solutions for high-volume hiring. Perfect for call centers, retail chains, and manufacturing plants.
                        </p>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#009A44]"></div> Assessment centers</li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#009A44]"></div> Rapid onboarding</li>
                        </ul>
                    </div>

                    <div className="bg-card p-8 rounded-xl border border-border shadow-sm">
                        <h3 className="text-xl font-bold mb-4">HR Consulting</h3>
                        <p className="text-muted-foreground mb-6">
                            Strategic advice on compensation, organizational design, and employer branding to help you retain top talent.
                        </p>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#009A44]"></div> Salary benchmarking</li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#009A44]"></div> Policy development</li>
                        </ul>
                    </div>
                </div>

                {/* Contact Section */}
                <div className="bg-muted/30 rounded-3xl p-8 md:p-12">
                    <div className="grid md:grid-cols-2 gap-12">
                        <div>
                            <h2 className="text-3xl font-bold mb-4">Let's Discuss Your Needs</h2>
                            <p className="text-muted-foreground mb-8">
                                Fill out the form and our corporate team will get back to you within 24 hours.
                            </p>
                            <div className="space-y-4">
                                <div>
                                    <div className="font-bold">Headquarters</div>
                                    <div className="text-sm text-muted-foreground">Bole Medhanialem, Addis Ababa, Ethiopia</div>
                                </div>
                                <div>
                                    <div className="font-bold">Corporate Sales</div>
                                    <div className="text-sm text-muted-foreground">+251 911 000 000</div>
                                </div>
                            </div>
                        </div>
                        <form className="space-y-4 bg-background p-6 rounded-xl shadow-sm border border-border">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Company Name</Label>
                                    <Input placeholder="Tech Corp" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Contact Person</Label>
                                    <Input placeholder="John Doe" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Work Email</Label>
                                <Input type="email" placeholder="john@company.com" />
                            </div>
                            <div className="space-y-2">
                                <Label>How can we help?</Label>
                                <Textarea className="min-h-[100px]" placeholder="We are looking to hire 5 senior developers..." />
                            </div>
                            <Button className="w-full bg-[#009A44] hover:bg-[#007A34] text-white">Send Request</Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
