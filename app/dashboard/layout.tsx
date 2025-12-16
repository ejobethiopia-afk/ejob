// app/dashboard/layout.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();

    if (!data?.user) {
        redirect('/login');
    }

    // Only enforce authentication here; per-page profile checks avoid redirect loops

    return <>{children}</>;
}
