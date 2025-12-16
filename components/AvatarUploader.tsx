"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AvatarUploaderProps {
  avatarUrl?: string | null;
  initials: string;
}

export default function AvatarUploader({ avatarUrl, initials }: AvatarUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File too large (max 5MB)");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selectedFile) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("avatar", selectedFile);

      const res = await fetch("/api/upload-avatar", {
        method: "POST",
        body: fd,
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || "Upload failed");
        setUploading(false);
        return;
      }

      // Refresh server components (header/profile) so new avatar_url is fetched
      router.refresh();
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex justify-center">
        <div className="relative">
          <Avatar className="h-32 w-32" aria-hidden={false}>
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <AvatarImage src={previewUrl} alt="Avatar preview" />
            ) : avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <AvatarImage src={avatarUrl} alt="Current avatar" />
            ) : (
              <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                {initials}
              </AvatarFallback>
            )}
          </Avatar>

          <div className="absolute right-0 bottom-0">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                ref={inputRef}
                name="avatar"
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => inputRef.current?.click()}
              >
                Change
              </Button>

              {selectedFile && (
                <>
                  <Button type="submit" size="sm" disabled={uploading}>
                    {uploading ? "Uploading..." : "Upload"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => { setSelectedFile(null); setPreviewUrl(null); setError(null); if (inputRef.current) inputRef.current.value = ""; }}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </form>
          </div>
        </div>
      </div>

      {error && <div className="mt-2 text-sm text-red-500 text-center">{error}</div>}
    </div>
  );
}
