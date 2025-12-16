"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePasswordAction } from "@/actions/auth-actions";
import { useRouter } from "next/navigation";

export default function UserSettings() {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [needsReset, setNeedsReset] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(false);
        setNeedsReset(false);

        const form = new FormData(e.currentTarget);
        const res = await updatePasswordAction(form);

        if (res?.error) {
            setError(res.error);
            // Casting to 'any' stops TypeScript from over-analyzing the logic here
            const response = res as any;
            if (response.needsRecentLogin) {
                setNeedsReset(true);
            }
            setSubmitting(false);
            return;
        }

        setSuccess(true);
        setSubmitting(false);
        // Optionally refresh server components or route
        try { router.refresh(); } catch (e) { }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Account Security</h3>
            <p className="text-sm text-muted-foreground">Change your password securely. You may be asked to re-authenticate if your session is old.</p>

            <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
                <div>
                    <Label htmlFor="current_password">Current Password (optional)</Label>
                    <Input id="current_password" name="current_password" type="password" />
                </div>

                <div>
                    <Label htmlFor="new_password">New Password</Label>
                    <Input id="new_password" name="new_password" type="password" required />
                </div>

                <div>
                    <Label htmlFor="confirm_password">Confirm New Password</Label>
                    <Input id="confirm_password" name="confirm_password" type="password" required />
                </div>

                {error && (
                    <div className="p-2 text-sm text-red-600 bg-red-50 rounded">{error}</div>
                )}

                {success && (
                    <div className="p-2 text-sm text-green-600 bg-green-50 rounded">Password updated successfully.</div>
                )}

                {needsReset && (
                    <div className="p-2 text-sm bg-yellow-50 rounded">
                        Your session may be too old to change the password directly. Use the <a className="underline" href="/auth/forgot-password">Forgot Password</a> flow to reset via email.
                    </div>
                )}

                <div className="flex gap-2">
                    <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Change Password'}</Button>
                </div>
            </form>
        </div>
    );
}
