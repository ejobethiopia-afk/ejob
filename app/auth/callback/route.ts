import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/";

    if (code) {
        const cookieStore = await cookies();

        // Create Supabase client with proper cookie handling
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookieStore.set(name, value, options);
                        });
                    },
                },
            }
        );

        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                console.log('OAuth user authenticated:', user.id, user.email);

                // Wait a moment for database trigger to create app_users record
                await new Promise(resolve => setTimeout(resolve, 500));

                // Check if user has a role assigned
                const { data: appUser, error: fetchError } = await supabase
                    .from('app_users')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                console.log('app_users role check:', { role: appUser?.role, fetchError });

                // If no role or role is null, redirect to role selection
                if (!appUser || !appUser.role) {
                    console.log('No role found, redirecting to role selection');
                    return NextResponse.redirect(`${origin}/select-role`);
                }

                console.log('User has role:', appUser.role, '- redirecting to home');
            }

            const forwardedHost = request.headers.get("x-forwarded-host");
            const isLocalEnv = process.env.NODE_ENV === "development";

            if (isLocalEnv) {
                return NextResponse.redirect(`${origin}${next}`);
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`);
            } else {
                return NextResponse.redirect(`${origin}${next}`);
            }
        } else {
            console.error('OAuth error:', error);
        }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/error`);
}
