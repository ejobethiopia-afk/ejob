// lib/supabase/client.ts

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        // CHANGED: Ensure the client file uses the same ANON_KEY as your server files
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}