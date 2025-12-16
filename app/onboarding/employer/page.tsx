"use client";

import { completeEmployerProfile } from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function EmployerOnboardingPage() {
    return (
        <div className="container max-w-lg mx-auto py-20">
            <Card>
                <CardHeader>
                    <CardTitle>Welcome! Tell us about your company.</CardTitle>
                    <CardDescription>
                        Create your employer profile to start posting jobs.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={async (formData) => {
                        await completeEmployerProfile(formData);
                    }} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="company_name">Company Name</Label>
                            <Input id="company_name" name="company_name" required placeholder="Acme Corp" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="company_website">Website (Optional)</Label>
                            <Input id="company_website" name="company_website" placeholder="https://acme.com" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="company_description">Description (Optional)</Label>
                            <Textarea
                                id="company_description"
                                name="company_description"
                                placeholder="We are a leading provider of..."
                            />
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
