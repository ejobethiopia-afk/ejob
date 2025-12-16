// app/dashboard/notifications/page.tsx
import { createClient } from "@/lib/supabase/server";
import NotificationsList from "@/components/NotificationsList";
import { redirect } from "next/navigation";

export default async function NotificationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If no user is logged in, send them to login
  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-foreground">Notifications</h1>
        <p className="text-muted-foreground">Manage your alerts and application updates.</p>
      </div>

      {/* Pass the userId to your existing component */}
      <NotificationsList userId={user.id} />
    </div>
  );
}