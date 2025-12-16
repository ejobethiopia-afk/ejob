// components/EmployerProfileSetup.tsx
import { createActionClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default function EmployerProfileSetup() {
    async function createEmployerProfile(formData: FormData) {
        'use server';

        const supabase = await createActionClient();
        const { data: { user } = {} } = await supabase.auth.getUser();

        if (!user) {
            redirect('/login');
        }

        const company_name = (formData.get('company_name') as string) || '';
        const industry = (formData.get('industry') as string) || '';
        const description = (formData.get('description') as string) || '';

        if (!company_name) {
            throw new Error('Company name is required');
        }

        // Insert profile with id = auth user id to satisfy FK
        const payload = {
            id: user.id,
            company_name,
            industry,
            description,
        };

        const { error } = await supabase.from('profiles').insert([payload]);

        if (error) {
            console.error('Failed to create employer profile:', error);
            throw new Error('Failed to create profile: ' + error.message);
        }

        // Ensure app_users marks role as employer (upsert to be tolerant)
        await supabase.from('app_users').upsert({ id: user.id, role: 'employer' });

        // Redirect back to dashboard after creation
        redirect('/dashboard');
    }

    return (
        <form action={createEmployerProfile} className="bg-card p-6 rounded-lg border border-border space-y-4 max-w-xl">
            <h2 className="text-2xl font-bold">Create Employer Profile</h2>

            <div className="space-y-2">
                <label className="text-sm font-medium block">Company Name *</label>
                <input name="company_name" type="text" required className="w-full p-2 border rounded-md" />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium block">Industry</label>
                <input name="industry" type="text" className="w-full p-2 border rounded-md" />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium block">Short Description</label>
                <textarea name="description" rows={4} className="w-full p-2 border rounded-md" />
            </div>

            <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md">Create Profile</button>
        </form>
    );
}
