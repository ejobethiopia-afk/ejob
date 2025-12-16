'use client';

import { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { toggleSaveJob } from '@/actions/job-actions';
import { toast } from 'sonner';

interface SaveJobButtonProps {
    jobId: string;
    initialIsSaved: boolean;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export default function SaveJobButton({ 
    jobId, 
    initialIsSaved = false,
    className = '',
    size = 'md'
}: SaveJobButtonProps) {
    const [isSaved, setIsSaved] = useState(initialIsSaved);
    const [isLoading, setIsLoading] = useState(false);

    // Update local state when initialIsSaved changes
    useEffect(() => {
        setIsSaved(initialIsSaved);
    }, [initialIsSaved]);

    const handleClick = async () => {
        if (isLoading) return;
        
        setIsLoading(true);
        try {
            const result = await toggleSaveJob(jobId);
            
            if (result.success) {
                // Update the local state based on the action
                const newState = result.action === 'saved';
                setIsSaved(newState);
                
                // Show appropriate toast message
                toast.success(newState ? 'Job saved!' : 'Job removed from saved');
                
                // Force a revalidation of the saved jobs page
                if (window.location.pathname === '/saved-jobs' || 
                    window.location.pathname.startsWith('/dashboard/saved')) {
                    window.location.reload();
                }
            } else {
                // Show error message if the operation failed
                toast.error(result.error || 'Failed to save job');
                
                // Revert the UI state if there was an error
                setIsSaved(initialIsSaved);
            }
        } catch (error) {
            console.error('Error toggling save:', error);
            toast.error('An error occurred. Please try again.');
            setIsSaved(initialIsSaved);
        } finally {
            setIsLoading(false);
        }
    };

    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12'
    };

    return (
        <button
            onClick={handleClick}
            disabled={isLoading}
            className={`flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors ${sizeClasses[size]} ${className}`}
            aria-label={isSaved ? "Unsave job" : "Save job"}
            title={isSaved ? "Unsave job" : "Save job for later"}
        >
            {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            ) : isSaved ? (
                <BookmarkCheck className="w-5 h-5 text-blue-500" fill="currentColor" />
            ) : (
                <Bookmark className="w-5 h-5 text-gray-400" />
            )}
        </button>
    );
}
