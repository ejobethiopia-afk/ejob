import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { MapPin, Building2, Timer, Eye, Layers } from 'lucide-react'
import Link from "next/link"
import { Job } from "@/types"
import { isUUID } from '@/lib/utils';

export function JobCardPremium({ job }: { job: Job }) {
    const idCandidate = (job as any).id ?? (job as any).uuid ?? (job as any).uuid_id;
    const jobHref = isUUID(String(idCandidate)) ? `/jobs/${idCandidate}` : `/jobs/${String(idCandidate)}`;
    return (
        <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-l-4 border-l-transparent hover:border-l-[#009A44]">
            <CardHeader className="p-6">
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <h3 className="font-bold text-xl mb-1 group-hover:text-primary transition-colors">{job.title}</h3>
                        <div className="flex items-center text-sm text-muted-foreground gap-2">
                            <Building2 className="w-4 h-4" />
                            <span>{job.company_name}</span>
                        </div>
                    </div>
                    <Badge variant={job.type === 'Full-time' ? 'default' : 'secondary'} className="bg-[#009A44] hover:bg-[#007A34]">
                        {job.type}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                    </div>
                    <div className="flex items-center gap-1">
                        <Layers className="w-4 h-4" />
                        {job.category}
                    </div>
                    <div className="flex items-center gap-1 font-semibold text-foreground">
                        {job.salary}
                    </div>
                    <div className="flex items-center gap-1 text-xs ml-auto">
                        <Eye className="w-3 h-3" />
                        {job.views_count || 0}
                    </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {job.description}
                </p>
            </CardContent>
            <CardFooter className="p-6 pt-0 flex gap-2">
                <Button asChild className="w-full bg-gradient-to-r from-[#009A44] to-[#F1B51C] hover:opacity-90 transition-opacity text-white border-none">
                    <Link href={jobHref}>Apply Now</Link>
                </Button>
            </CardFooter>
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#FEDD00]/10 to-transparent rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-500" />
        </Card >
    )
}
