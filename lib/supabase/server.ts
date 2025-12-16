// lib/supabase/server.ts - FINAL, DEFINITIVE FIX (Using await as Next.js demands)

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";




/**
 * Creates a SUPABASE client for Server Components (page.tsx).
 * FIX: Using 'await cookies()' to satisfy the explicit Next.js runtime demand.
 */
export async function createClient() { // 🔑 Key Fix: Function MUST be async
    // 🔑 Key Fix: Await the cookies() result and cast to 'any' to bypass typing conflicts
    const cookieStore = (await cookies()) as any;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) return {} as any;

    return createServerClient(
        url,
        key,
        {
            cookies: {
                get(name: string) {
                    // Your code: return cookieStore.get(name)?.value;
                    // TypeScript is complaining about `cookieStore.get`
                    // The cast handles this.
                    return cookieStore.get(name)?.value;
                },
                // SET and REMOVE are omitted for read-only client
            },
        }
    );
}

/**
 * Creates an ASYNCHRONOUS client for Server Actions and Route Handlers.
 * FIX: Also using 'await cookies()' to resolve the identical error in this context.
 */
export async function createActionClient() {
    // 🔑 Key Fix: Await the cookies() result and cast to 'any'
    const cookieStore = (await cookies()) as any;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) return {} as any;

    return createServerClient(
        url,
        key,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    cookieStore.set(name, value, options);
                },
                remove(name: string, options: CookieOptions) {
                    cookieStore.delete(name, options);
                },
            },
        },
    );
}

/**
 * Creates a SUPABASE client with SERVICE ROLE for admin tasks.
 * Bypasses RLS. Use with caution.
 */
export function createAdminClient() {
    // Only access environment variables inside the function to avoid build-time crashes
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !adminKey) {
        // Return dummy object if environment variables are missing during build
        return {} as any;
    }

    // This client does not need user cookies, so it is simple.
    return createServerClient(
        url,
        adminKey,
        {
            cookies: {
                get() { return undefined; },
                set() { },
                remove() { },
            },
        }
    );
}