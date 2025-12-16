'use client';

import { incrementJobView } from '@/actions/job-actions';
import { useEffect, useRef } from 'react';

export default function ViewCounter({ jobId }: { jobId: string }) {
    const hasIncremented = useRef(false);

    useEffect(() => {
        if (!hasIncremented.current) {
            incrementJobView(jobId).catch(console.error);
            hasIncremented.current = true;
        }
    }, [jobId]);

    return null; // This component does not render anything visual
}
