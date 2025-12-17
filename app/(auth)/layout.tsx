import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { SessionManager } from "@/components/session-manager";

export const metadata: Metadata = {
    title: "Authentication - Ejob Ethiopia",
    description: "Sign in or create an account to find your dream job in Ethiopia",
};

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <SessionManager />
            {children}
        </ThemeProvider>
    );
}
