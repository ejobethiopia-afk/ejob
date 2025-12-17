"use client";

import { useEffect, useRef, useState } from "react";

declare global {
    interface Window {
        grecaptcha: any;
        onRecaptchaLoad: () => void;
    }
}

interface CaptchaProps {
    onVerify: (token: string) => void;
    onExpire?: () => void;
    onError?: () => void;
    theme?: "light" | "dark";
}

export function Captcha({ onVerify, onExpire, onError, theme = "light" }: CaptchaProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [widgetId, setWidgetId] = useState<number | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Load reCAPTCHA script
        const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

        if (!siteKey) {
            console.error("reCAPTCHA site key not found");
            return;
        }

        // Check if script already exists
        if (document.getElementById("recaptcha-script")) {
            if (window.grecaptcha?.render) {
                setIsLoaded(true);
            }
            return;
        }

        // Create script element
        const script = document.createElement("script");
        script.id = "recaptcha-script";
        script.src = "https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit";
        script.async = true;
        script.defer = true;

        // Setup callback
        window.onRecaptchaLoad = () => {
            setIsLoaded(true);
        };

        document.body.appendChild(script);

        return () => {
            // Cleanup
            if (widgetId !== null && window.grecaptcha) {
                try {
                    window.grecaptcha.reset(widgetId);
                } catch (e) {
                    // Ignore errors during cleanup
                }
            }
        };
    }, []);

    useEffect(() => {
        if (!isLoaded || !containerRef.current || widgetId !== null) return;

        const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
        if (!siteKey) return;

        try {
            const id = window.grecaptcha.render(containerRef.current, {
                sitekey: siteKey,
                theme: theme,
                callback: onVerify,
                "expired-callback": onExpire,
                "error-callback": onError,
            });
            setWidgetId(id);
        } catch (e) {
            console.error("Error rendering reCAPTCHA:", e);
        }
    }, [isLoaded, theme, onVerify, onExpire, onError, widgetId]);

    return <div ref={containerRef} className="flex justify-center my-4" />;
}

export function resetCaptcha(widgetId?: number) {
    if (window.grecaptcha && widgetId !== undefined) {
        try {
            window.grecaptcha.reset(widgetId);
        } catch (e) {
            console.error("Error resetting reCAPTCHA:", e);
        }
    }
}
