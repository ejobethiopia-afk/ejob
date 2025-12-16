"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Save, X, ExternalLink, Briefcase, GraduationCap, MapPin } from "lucide-react";
import { completeSeekerProfile } from "@/actions/auth-actions";
import EducationEditor from "@/components/EducationEditor";
import ExperienceEditor from "@/components/ExperienceEditor";
import SkillTagInput from "@/components/SkillTagInput";

interface JobSeekerProfileFormProps {
    userId: string;
    fullName?: string;
    // If true, do not render the internal Edit button (parent will control editing)
    hideEditButton?: boolean;
    // If provided, the component will enter edit mode on mount
    startEditing?: boolean;
    // Called after a successful save (parent can close modal)
    onSuccess?: () => void;
}

export function JobSeekerProfileForm({ userId, fullName, hideEditButton = false, startEditing = false, onSuccess }: JobSeekerProfileFormProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [profile, setProfile] = useState<any>({
        bio: "",
        location: "",
        resume_url: "",
        education: [] as any[],
        experience: [] as any[],
        skills: "",
        phone_number: "",
        linkedin_url: "",
        github_url: "",
        portfolio_url: "",
    });

    const [editedProfile, setEditedProfile] = useState(profile);
    const supabase = createClient();

    useEffect(() => {
        const fetchProfile = async () => {
            const { data, error } = await supabase
                .from("job_seeker_profiles")
                .select("*")
                .eq("user_id", userId)
                .maybeSingle();

            // If no profile exists yet, maybeSingle returns null data without a 406 error.
            if (error) {
                // Log non-critical errors (e.g., authorization issues) for debugging
                console.debug("job_seeker_profiles fetch error:", error);
            }

            if (data) {
                // Normalize education/experience fields to arrays
                let educationData: any[] = [];
                try {
                    if (Array.isArray(data.education)) educationData = data.education;
                    else if (typeof data.education === 'string' && data.education) educationData = JSON.parse(data.education);
                } catch (e) {
                    educationData = [];
                }

                let experienceData: any[] = [];
                try {
                    if (Array.isArray(data.experience)) experienceData = data.experience;
                    else if (typeof data.experience === 'string' && data.experience) experienceData = JSON.parse(data.experience);
                } catch (e) {
                    experienceData = [];
                }

                const profileData = {
                    bio: data.bio || "",
                    location: data.location || "",
                    resume_url: data.resume_url || "",
                    education: educationData,
                    experience: experienceData,
                    skills: data.skills || "",
                    phone_number: data.phone_number || "",
                    linkedin_url: data.linkedin_url || "",
                    github_url: data.github_url || "",
                    portfolio_url: data.portfolio_url || "",
                };
                setProfile(profileData);
                setEditedProfile(profileData);
            }

                // avatar is shown/edited in the left column via AvatarUploader

            setLoading(false);
        };

        fetchProfile();
    }, [userId]);

    // allow parent to force edit mode on mount
    useEffect(() => {
        if (startEditing) {
            setIsEditing(true);
            setEditedProfile(profile);
            setError(null);
            setSuccess(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startEditing]);

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
        const result = await completeSeekerProfile(formData);

        if (result?.error) {
            setError(result.error);
            setSubmitting(false);
        } else {
            // Refresh server data to pick up JSONB arrays and any server-side normalizations
            try {
                router.refresh();
            } catch (e) {
                // ignore
            }
            setSuccess(true);
            setSubmitting(false);
            setIsEditing(false);
            if (onSuccess) onSuccess();
        }
    };

    // Note: Avatar upload is handled in the left column `AvatarUploader`.

    if (loading) {
        return <div className="animate-pulse">Loading profile...</div>;
    }

    // `skills` in the DB may be a text[] (array) or a comma-separated string.
    // Normalize to a string array for rendering.
    const skills: string[] = Array.isArray(profile.skills)
        ? (profile.skills as string[]).filter(Boolean)
        : (typeof profile.skills === 'string' && profile.skills.length > 0)
            ? profile.skills.split(",").map((s: string) => s.trim()).filter(Boolean)
            : [];

    return (
        <div className="space-y-6">
            {/* Header with Edit Button */}
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">Professional Profile</h2>
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
                            <CardTitle>Edit Your Profile</CardTitle>
                            <CardDescription>Update your professional information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone_number">Phone Number</Label>
                                    <Input
                                        id="phone_number"
                                        name="phone_number"
                                        type="tel"
                                        value={editedProfile.phone_number}
                                        onChange={(e) => setEditedProfile({ ...editedProfile, phone_number: e.target.value })}
                                        placeholder="+251-xxxxxxxxx"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                                    <Input
                                        id="linkedin_url"
                                        name="linkedin_url"
                                        type="url"
                                        value={editedProfile.linkedin_url}
                                        onChange={(e) => setEditedProfile({ ...editedProfile, linkedin_url: e.target.value })}
                                        placeholder="https://www.linkedin.com/in/yourname"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio">Professional Bio</Label>
                                <Textarea
                                    id="bio"
                                    name="bio"
                                    rows={4}
                                    value={editedProfile.bio}
                                    onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                                    placeholder="Tell us about yourself..."
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

                            <div className="space-y-2">
                                <Label htmlFor="resume_url">Resume URL</Label>
                                <Input
                                    id="resume_url"
                                    name="resume_url"
                                    type="url"
                                    value={editedProfile.resume_url}
                                    onChange={(e) => setEditedProfile({ ...editedProfile, resume_url: e.target.value })}
                                    placeholder="https://linkedin.com/in/..."
                                />
                            </div>

                            <div className="space-y-2">
                                <EducationEditor initialValue={editedProfile.education} />
                            </div>

                            <div className="space-y-2">
                                <ExperienceEditor initialValue={editedProfile.experience} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="skills">Skills</Label>
                                <SkillTagInput name="skills" initialValue={editedProfile.skills} placeholder="e.g. JavaScript, React" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="github_url">GitHub URL</Label>
                                    <Input
                                        id="github_url"
                                        name="github_url"
                                        type="url"
                                        value={editedProfile.github_url}
                                        onChange={(e) => setEditedProfile({ ...editedProfile, github_url: e.target.value })}
                                        placeholder="https://github.com/username"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="portfolio_url">Portfolio URL (optional)</Label>
                                    <Input
                                        id="portfolio_url"
                                        name="portfolio_url"
                                        type="url"
                                        value={editedProfile.portfolio_url}
                                        onChange={(e) => setEditedProfile({ ...editedProfile, portfolio_url: e.target.value })}
                                        placeholder="https://yourportfolio.com"
                                    />
                                </div>
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

                    {/* Avatar is now edited in the left column via AvatarUploader */}

                    {/* Section A: Professional Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Professional Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="text-2xl font-bold">{(typeof fullName !== 'undefined' && fullName) ? fullName : "Candidate"}</h3>
                                {profile.location && (
                                    <p className="text-muted-foreground flex items-center gap-1 mt-1">
                                        <MapPin className="h-4 w-4" />
                                        {profile.location}
                                    </p>
                                )}
                            </div>
                            {profile.bio && (
                                <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Section B: Core Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Briefcase className="h-5 w-5" />
                                Core Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {profile.experience && profile.experience.length > 0 && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Experience</p>
                                    <p className="font-medium">{profile.experience.length} role{profile.experience.length > 1 ? 's' : ''}</p>
                                </div>
                            )}
                            {profile.resume_url && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Resume</p>
                                    <Button asChild variant="outline" size="sm">
                                        <a href={profile.resume_url} target="_blank" rel="noopener noreferrer">
                                            View Resume
                                            <ExternalLink className="h-4 w-4 ml-2" />
                                        </a>
                                    </Button>
                                </div>
                            )}

                            {profile.phone_number && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Phone</p>
                                    <p className="font-medium">{profile.phone_number}</p>
                                </div>
                            )}
                            {profile.linkedin_url && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">LinkedIn</p>
                                    <Button asChild variant="outline" size="sm">
                                        <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                                            View LinkedIn
                                            <ExternalLink className="h-4 w-4 ml-2" />
                                        </a>
                                    </Button>
                                </div>
                            )}
                            {profile.github_url && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">GitHub</p>
                                    <Button asChild variant="outline" size="sm">
                                        <a href={profile.github_url} target="_blank" rel="noopener noreferrer">
                                            View GitHub
                                            <ExternalLink className="h-4 w-4 ml-2" />
                                        </a>
                                    </Button>
                                </div>
                            )}
                            {profile.portfolio_url && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Portfolio</p>
                                    <Button asChild variant="outline" size="sm">
                                        <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer">
                                            View Portfolio
                                            <ExternalLink className="h-4 w-4 ml-2" />
                                        </a>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Section C: Education */}
                    {profile.education && profile.education.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5" />
                                    Education
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {profile.education.map((e: any, i: number) => (
                                        <div key={i} className="">
                                            <p className="font-medium">{e.institution || ""} {e.field_of_study ? `— ${e.field_of_study}` : ""}</p>
                                            {e.graduation_date && <p className="text-sm text-muted-foreground">{e.graduation_date}</p>}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {profile.experience && profile.experience.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Briefcase className="h-5 w-5" />
                                    Experience
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {profile.experience.map((ex: any, idx: number) => (
                                        <div key={idx}>
                                            <p className="font-medium">{ex.company || ""}</p>
                                            <p className="text-sm text-muted-foreground">{ex.start_date || ""} — {ex.currently ? 'Present' : (ex.end_date || '')}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Section D: Skills */}
                    {skills.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Skills</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {skills.map((skill: string, index: number) => (
                                        <Badge key={index} variant="secondary">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}
