"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { logoutUser } from "@/actions/auth-actions";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    // Show confirmation dialog
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (!confirmed) return;

    setIsLoading(true);

    try {
      const result = await logoutUser();

      if (result?.success) {
        // Force a full page reload to clear all client-side state
        window.location.href = '/login';
      } else {
        throw new Error('Logout was not successful');
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to logout. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      disabled={isLoading}
      variant="ghost"
      className="w-full justify-start"
    >
      {isLoading ? "Logging out..." : "Logout"}
    </Button>
  );
}
