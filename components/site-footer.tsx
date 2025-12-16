import Link from "next/link";

export function SiteFooter() {
    return (
        <footer className="w-full bg-[#1a1a1a] text-white py-12">
            <div className="container max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
                <div className="space-y-4">
                    <h3 className="text-lg font-bold">Ejob Ethiopia</h3>
                    <p className="text-sm text-gray-400">Connecting talent with opportunity across the Horn of Africa.</p>
                </div>
                <div>
                    <h4 className="font-semibold mb-4 text-[#009A44]">For Job Seekers</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                        <li><Link href="/" className="hover:text-white">Browse Jobs</Link></li>
                        <li><Link href="/saved-jobs" className="hover:text-white">Saved Jobs</Link></li>
                        <li><Link href="/upload-cv" className="hover:text-white">Upload CV</Link></li>
                        <li><Link href="/job-alerts" className="hover:text-white">Job Alerts</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold mb-4 text-[#FEDD00]">For Employers</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                        <li><Link href="/dashboard/new" className="hover:text-white">Post a Job</Link></li>
                        <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                        <li><Link href="/recruitment" className="hover:text-white">Recruitment Solutions</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold mb-4 text-[#D6001C]">Contact</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                        <li>Addis Ababa, Ethiopia</li>
                        <li>ejobethiopia@gmail.com</li>
                    </ul>
                </div>
            </div>
            <div className="mt-12 pt-8 border-t border-white/10 text-center text-xs text-gray-500">
                &copy; {new Date().getFullYear()} Ejob Ethiopia. All rights reserved.
            </div>
        </footer>
    );
}
