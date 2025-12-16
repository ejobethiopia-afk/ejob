"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import { signUpAction } from "@/actions/auth-actions";
import { UserRole } from "@/types";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [role, setRole] = useState<UserRole>("job_seeker");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);

    const pwd = formData.get("password") as string;
    const confirmPwd = formData.get("confirmPassword") as string;
    const username = formData.get("username") as string;

    // Client-side validation: Check for spaces in username
    if (username && username.includes(' ')) {
      setError("Username cannot contain spaces");
      setIsLoading(false);
      return;
    }

    if (pwd !== confirmPwd) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    formData.append("role", role);

    const result = await signUpAction(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
    // Redirect happens on server side if success
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Sign up</CardTitle>
          <CardDescription>Create a new account</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit}>
            <div className="flex flex-col gap-6">

              {/* Role Selection */}
              <div className="grid gap-3">
                <Label>I am a...</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    onClick={() => setRole("job_seeker")}
                    className={cn(
                      "cursor-pointer border rounded-lg p-4 text-center transition-all",
                      role === "job_seeker"
                        ? "border-green-600 bg-green-600 dark:bg-green-700 ring-1 ring-green-600 text-white"
                        : "border-border hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <div className="font-semibold">Job Seeker</div>
                    <div className={cn(
                      "text-xs",
                      role === "job_seeker"
                        ? "text-green-100"
                        : "text-muted-foreground"
                    )}>I want to find a job</div>
                  </div>
                  <div
                    onClick={() => setRole("employer")}
                    className={cn(
                      "cursor-pointer border rounded-lg p-4 text-center transition-all",
                      role === "employer"
                        ? "border-blue-600 bg-blue-600 dark:bg-blue-700 ring-1 ring-blue-600 text-white"
                        : "border-border hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <div className="font-semibold">Employer</div>
                    <div className={cn(
                      "text-xs",
                      role === "employer"
                        ? "text-blue-100"
                        : "text-muted-foreground"
                    )}>I want to hire talent</div>
                  </div>
                </div>
              </div>

              {/* Full Name Field */}
              <div className="grid gap-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  type="text"
                  placeholder="John Doe"
                  required
                />
              </div>

              {/* Username Field */}
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="johndoe"
                  required
                  minLength={3}
                  maxLength={20}
                />
                <p className="text-xs text-muted-foreground">
                  Choose a unique username (3-20 characters)
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                </div>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Sign up"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="/auth/login" className="underline underline-offset-4">
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
