// app/dashboard/profile-setup/page.tsx
import EmployerProfileSetup from '@/components/EmployerProfileSetup';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ProfileSetupPage() {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();

    if (!data?.user) {
        redirect('/login');
    }

    // If profile already exists, send them to dashboard
    const { data: profile } = await supabase.from('profiles').select('id').eq('id', data.user.id).maybeSingle();
    if (profile) {
        redirect('/dashboard');
    }

    return (
        <main className="min-h-screen p-5 pt-12 flex justify-center">
            <div className="w-full max-w-2xl">
                <EmployerProfileSetup />
            </div>
        </main>
    );
}
