import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CompaniesPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <section className="py-20 lg:py-32 bg-gray-50 dark:bg-zinc-900 border-b">
                <div className="container px-4 md:px-6 mx-auto text-center">
                    <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl bg-clip-text text-transparent bg-gradient-to-br from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 mb-6">
                        Explore Companies
                    </h1>
                    <p className="mx-auto max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400 mb-8">
                        Discover top companies hiring in Ethiopia. Learn about their culture, benefits, and open positions.
                    </p>
                    <div className="p-8 border border-dashed rounded-lg bg-white/50 dark:bg-black/20">
                        <p className="text-muted-foreground">Company directory coming soon...</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
