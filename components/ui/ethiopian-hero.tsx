'use client';

import Link from "next/link"
import { Search } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function EthiopianHero() {
    const [searchTerm, setSearchTerm] = useState('')
    const router = useRouter()

    const handleSearch = () => {
        if (searchTerm.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    return (
        <div className="relative w-full overflow-hidden min-h-[600px] flex items-center justify-center">
            {/* Background Image with Overlay */}
            {/* Background Gradient */}
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d]">
                {/* Ethiopian Flag Gradient Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,154,68,0.2),rgba(254,221,0,0.2),rgba(214,0,28,0.2))]" />
                {/* Tibeb Pattern Overlay Effect - CSS Gradient */}
                <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-[#009A44] via-[#FEDD00] to-[#D6001C]" />
            </div>

            <div className="relative z-10 container px-4 md:px-6 flex flex-col items-center text-center gap-8">
                <div className="space-y-4 max-w-3xl">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-white drop-shadow-md">
                        Find Your Dream Job in <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#009A44] via-[#FEDD00] to-[#D6001C]">Ethiopia</span>
                    </h1>
                    <p className="text-xl text-gray-200 md:text-2xl max-w-[700px] mx-auto">
                        Connect with top employers in Addis Ababa and beyond. Your next opportunity awaits.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="w-full max-w-2xl flex flex-col sm:flex-row gap-2 p-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-300" />
                        <Input
                            placeholder="Job title, keywords, or company"
                            className="pl-9 bg-transparent border-none text-white placeholder:text-gray-300 focus-visible:ring-0 focus-visible:ring-offset-0"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                    <Button size="lg" className="bg-[#009A44] hover:bg-[#007A34] text-white" onClick={handleSearch}>
                        Search Jobs
                    </Button>
                </div>

                <div className="flex gap-4 text-sm text-gray-300 flex-wrap justify-center">
                    <span>Popular:</span>
                    <Link href="/search?q=Tech" className="hover:text-[#FEDD00] transition-colors underline-offset-4 hover:underline">Tech</Link>
                    <Link href="/search?q=Engineering" className="hover:text-[#FEDD00] transition-colors underline-offset-4 hover:underline">Engineering</Link>
                    <Link href="/search?q=Finance" className="hover:text-[#FEDD00] transition-colors underline-offset-4 hover:underline">Finance</Link>
                    <Link href="/search?q=NGO" className="hover:text-[#FEDD00] transition-colors underline-offset-4 hover:underline">NGO</Link>
                </div>
            </div>

            {/* Decorative Bottom Pattern Strip */}
            <div className="absolute bottom-0 w-full h-[6px] flex">
                <div className="h-full w-1/3 bg-[#009A44]" />
                <div className="h-full w-1/3 bg-[#FEDD00]" />
                <div className="h-full w-1/3 bg-[#D6001C]" />
            </div>
        </div>
    )
}
