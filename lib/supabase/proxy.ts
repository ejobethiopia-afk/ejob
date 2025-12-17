import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: DO NOT REMOVE auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Define public auth routes that don't require authentication
  const publicAuthRoutes = [
    '/login',
    '/sign-up',
    '/forgot-password',
    '/sign-up-success',
    '/update-password',
    '/auth/callback',
    '/auth/confirm',
    '/auth/error'
  ];

  const isPublicAuthRoute = publicAuthRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (
    !user &&
    request.nextUrl.pathname !== "/" &&
    !isPublicAuthRoute
  ) {
    // no user, potentially respond by redirecting the user to the login page
    // For now we allow viewing the home page without login (pathname !== "/") check above
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
