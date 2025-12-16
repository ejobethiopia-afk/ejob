"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import AvatarUploader from "@/components/AvatarUploader";
import { Badge } from "@/components/ui/badge";
import { JobSeekerProfileForm } from "@/components/JobSeekerProfileForm";
import { EmployerProfileForm } from "@/components/EmployerProfileForm";
import ProfileEditorModal from "@/components/ProfileEditorModal";
import UserSettings from "@/components/UserSettings";

interface ProfileClientProps {
  userId: string;
  appUser: {
    role: string;
    full_name?: string | null;
    username?: string | null;
    avatar_url?: string | null;
    email?: string | null;
  };
}

export default function ProfileClient({ userId, appUser }: ProfileClientProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const displayName = appUser.full_name || appUser.username || "User";
  const initials = displayName
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-[300px_1fr] gap-8">
          <div className="space-y-6">
            <div className="bg-card border rounded-lg p-6 space-y-4 sticky top-24">
              <div className="flex justify-center">
                <AvatarUploader avatarUrl={appUser.avatar_url} initials={initials} />
              </div>
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold">{displayName}</h1>
                {appUser.username && (
                  <p className="text-muted-foreground">@{appUser.username}</p>
                )}
                <Badge variant={appUser.role === "job_seeker" ? "default" : "secondary"}>
                  {appUser.role === "job_seeker" ? "Job Seeker" : "Employer"}
                </Badge>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{appUser.email}</p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-end gap-2 mb-4">
              <Button onClick={() => setIsSettingsOpen(true)} variant="ghost">Account Settings</Button>
              <Button onClick={() => setIsEditing(true)} variant="outline">Edit Profile</Button>
            </div>

            {appUser.role === "job_seeker" ? (
              <JobSeekerProfileForm userId={userId} fullName={displayName} hideEditButton />
            ) : (
              <EmployerProfileForm userId={userId} hideEditButton />
            )}
          </div>
        </div>
      </div>

      <ProfileEditorModal open={isEditing} onClose={() => setIsEditing(false)} title="Edit Profile">
        {appUser.role === "job_seeker" ? (
          <JobSeekerProfileForm userId={userId} fullName={displayName} startEditing onSuccess={() => setIsEditing(false)} />
        ) : (
          <EmployerProfileForm userId={userId} startEditing onSuccess={() => setIsEditing(false)} />
        )}
      </ProfileEditorModal>

      <ProfileEditorModal open={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title="Account Settings">
        <UserSettings />
      </ProfileEditorModal>
    </div>
  );
}
