"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/client";
import { LogoutButton } from "./logout-button";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserProfile {
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

export function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // Fetch complete profile from app_users table
      if (user) {
        const { data: appUser } = await supabase
          .from('app_users')
          .select('full_name, username, avatar_url')
          .eq('id', user.id)
          .single();

        setProfile(appUser);
      }

      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);

      // Fetch profile when auth state changes
      if (session?.user) {
        const { data: appUser } = await supabase
          .from('app_users')
          .select('full_name, username, avatar_url')
          .eq('id', session.user.id)
          .single();

        setProfile(appUser);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div className="h-9 w-20 bg-muted/50 rounded-md animate-pulse" />;
  }

  // Get display name and initials
  const displayName = profile?.full_name || profile?.username || user?.email || "User";
  const username = profile?.username || "";
  const initials = displayName
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return user ? (
    <div className="flex items-center gap-4">
      <Link
        href="/profile"
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium hidden sm:inline-block">
          {username ? `@${username}` : displayName}
        </span>
      </Link>
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
