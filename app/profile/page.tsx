import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileClient from "@/components/ProfileClient";

export default async function ProfilePage() {
    const supabase = await createClient();

    // 1. Check authentication
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // 2. Fetch complete user data from app_users table
    const { data: appUser, error } = await supabase
        .from("app_users")
        .select("role, full_name, username, avatar_url, email")
        .eq("id", user.id)
        .single();

    if (error || !appUser) {
        return (
            <div className="container mx-auto py-10 px-4">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-2xl font-bold text-red-500">Error Loading Profile</h1>
                    <p className="text-muted-foreground mt-2">
                        Unable to load your profile. Please try again later.
                    </p>
                </div>
            </div>
        );
    }

    // Get display name and initials
    const displayName = appUser.full_name || appUser.username || "User";
    const initials = displayName
        .split(" ")
        .map((n: any[]) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return <ProfileClient userId={user.id} appUser={appUser} />;
}
