"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Save, X, ExternalLink, Building2, MapPin } from "lucide-react";
import { completeEmployerProfile } from "@/actions/auth-actions";
import { uploadCompanyLogoAction } from "@/actions/profile-actions";

interface EmployerProfileFormProps {
    userId: string;
    hideEditButton?: boolean;
    startEditing?: boolean;
    onSuccess?: () => void;
}

export function EmployerProfileForm({ userId, hideEditButton = false, startEditing = false, onSuccess }: EmployerProfileFormProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [profile, setProfile] = useState({
        company_name: "",
        company_logo: "",
        company_website: "",
        company_description: "",
        location: "",
    });

    const [editedProfile, setEditedProfile] = useState(profile);
    const [logoError, setLogoError] = useState<string | null>(null);
    
    const supabase = createClient();

    useEffect(() => {
        const fetchProfile = async () => {
            const { data, error } = await supabase
                .from("employer_profiles")
                .select("*")
                .eq("user_id", userId)
                .single();

            if (data) {
                const profileData = {
                    company_name: data.company_name || "",
                    company_logo: data.company_logo || "",
                    company_website: data.company_website || "",
                    company_description: data.company_description || "",
                    location: data.location || "",
                };
                setProfile(profileData);
                setEditedProfile(profileData);
            }

            // company_logo is read into `profile` and used for preview

            setLoading(false);
        };

        fetchProfile();
    }, [userId]);

    useEffect(() => {
        if (startEditing) {
            setIsEditing(true);
            setEditedProfile(profile);
            setError(null);
            setSuccess(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startEditing]);

    // no preview object URLs to revoke; we use stored URLs in `profile.company_logo`

    const handleEdit = () => {
        setIsEditing(true);
        setEditedProfile(profile);
        setError(null);
        setSuccess(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedProfile(profile);
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(false);

        const formData = new FormData(e.currentTarget);
        const result = await completeEmployerProfile(formData);

        if (result?.error) {
            setError(result.error);
            setSubmitting(false);
        } else {
            setProfile(editedProfile);
            setSuccess(true);
            setSubmitting(false);
            setIsEditing(false);
            if (onSuccess) onSuccess();
        }
    };

    // File upload UI removed from view mode; keep edit-mode URL input

    if (loading) {
        return <div className="animate-pulse">Loading profile...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header with Edit Button */}
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">Company Profile</h2>
                {!isEditing && !hideEditButton && (
                    <Button onClick={handleEdit} variant="outline">
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit Profile
                    </Button>
                )}
            </div>

            {isEditing ? (
                /* EDIT MODE */
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Edit Company Profile</CardTitle>
                            <CardDescription>Update your company information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="company_name">Company Name *</Label>
                                <Input
                                    id="company_name"
                                    name="company_name"
                                    required
                                    value={editedProfile.company_name}
                                    onChange={(e) => setEditedProfile({ ...editedProfile, company_name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="company_logo">Company Logo URL</Label>
                                <Input
                                    id="company_logo"
                                    name="company_logo"
                                    type="url"
                                    value={editedProfile.company_logo}
                                    onChange={(e) => setEditedProfile({ ...editedProfile, company_logo: e.target.value })}
                                    placeholder="https://example.com/logo.png"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="company_website">Company Website</Label>
                                    <Input
                                        id="company_website"
                                        name="company_website"
                                        type="url"
                                        value={editedProfile.company_website}
                                        onChange={(e) => setEditedProfile({ ...editedProfile, company_website: e.target.value })}
                                        placeholder="https://company.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location">Location</Label>
                                    <Input
                                        id="location"
                                        name="location"
                                        value={editedProfile.location}
                                        onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                                        placeholder="City, Country"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="company_description">Company Description</Label>
                                <Textarea
                                    id="company_description"
                                    name="company_description"
                                    rows={6}
                                    value={editedProfile.company_description}
                                    onChange={(e) => setEditedProfile({ ...editedProfile, company_description: e.target.value })}
                                    placeholder="Tell us about your company..."
                                />
                            </div>

                            {error && (
                                <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950 rounded-md">
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Button type="submit" disabled={submitting}>
                                    <Save className="h-4 w-4 mr-2" />
                                    {submitting ? "Saving..." : "Save Changes"}
                                </Button>
                                <Button type="button" variant="outline" onClick={handleCancel}>
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            ) : (
                /* VIEW MODE */
                <div className="space-y-6">
                    {success && (
                        <div className="p-3 text-sm text-green-500 bg-green-50 dark:bg-green-950 rounded-md">
                            Profile updated successfully!
                        </div>
                    )}

                    {/* Section A: Company Branding */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-6">
                                {profile.company_logo && (
                                    <div className="relative h-24 w-24 rounded-lg overflow-hidden border bg-muted flex-shrink-0">
                                        <img
                                            src={profile.company_logo}
                                            alt={profile.company_name}
                                            className="w-full h-full object-contain p-2"
                                        />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h3 className="text-3xl font-bold flex items-center gap-2">
                                        <Building2 className="h-8 w-8" />
                                        {profile.company_name}
                                    </h3>
                                    {profile.location && (
                                        <p className="text-muted-foreground flex items-center gap-1 mt-2">
                                            <MapPin className="h-4 w-4" />
                                            {profile.location}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Company Logo preview (uses `profile.company_logo`) */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Company Logo</CardTitle>
                            <CardDescription>Your company logo preview</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="h-20 w-20 rounded overflow-hidden bg-muted flex items-center justify-center">
                                    {profile.company_logo ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={profile.company_logo} alt={profile.company_name} className="h-full w-full object-contain p-2" />
                                    ) : (
                                        <div className="text-sm text-muted-foreground">No logo</div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-medium">{profile.company_name}</h3>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section B: Company Details */}
                    {profile.company_website && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Company Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Website</p>
                                    <Button asChild variant="outline" size="sm">
                                        <a href={profile.company_website} target="_blank" rel="noopener noreferrer">
                                            Visit Website
                                            <ExternalLink className="h-4 w-4 ml-2" />
                                        </a>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Section C: About Us */}
                    {profile.company_description && (
                        <Card>
                            <CardHeader>
                                <CardTitle>About Us</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                                    {profile.company_description}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}
