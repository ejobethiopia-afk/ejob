"use client";

import { completeSeekerProfile } from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SeekerOnboardingPage() {
    return (
        <div className="container max-w-lg mx-auto py-20">
            <Card>
                <CardHeader>
                    <CardTitle>Welcome! Let's build your profile.</CardTitle>
                    <CardDescription>
                        Help employers find you by providing your details.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={async (formData) => {
                        await completeSeekerProfile(formData);
                    }} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="first_name">First Name</Label>
                                <Input id="first_name" name="first_name" required placeholder="John" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="last_name">Last Name</Label>
                                <Input id="last_name" name="last_name" required placeholder="Doe" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="resume_url">Resume URL (Optional)</Label>
                            <Input id="resume_url" name="resume_url" placeholder="https://linkedin.com/..." />
                        </div>

                        <Button type="submit" className="w-full">
                            Complete Profile
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
