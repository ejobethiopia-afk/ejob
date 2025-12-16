"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export function SessionManager() {
    const router = useRouter();
    const supabase = createClient();
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const resetTimer = () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }

            timerRef.current = setTimeout(async () => {
                // Sign out and redirect
                await supabase.auth.signOut();
                router.push("/auth/login");
            }, INACTIVITY_TIMEOUT);
        };

        // Events to listen for
        const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];

        // Attach listeners
        events.forEach((event) => {
            window.addEventListener(event, resetTimer);
        });

        // Initial timer start
        resetTimer();

        // Cleanup
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            events.forEach((event) => {
                window.removeEventListener(event, resetTimer);
            });
        };
    }, [router, supabase]);

    return null; // This component doesn't render anything
}
