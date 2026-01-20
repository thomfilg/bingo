import { auth } from "@repo/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware configuration for authentication
 *
 * This middleware checks authentication status and redirects
 * unauthenticated users to the login page for protected routes.
 */
export async function middleware(request: NextRequest) {
  // Use the auth middleware from next-auth
  const session = await auth();
  const { pathname } = request.nextUrl;

  // Check if user is authenticated
  const isAuthenticated = !!session;

  // Define protected routes (add routes that require authentication)
  const protectedRoutes = ["/dashboard", "/profile", "/settings"];

  // Check if current path is a protected route
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname.startsWith(route)
  );

  // Redirect to login if accessing protected route without authentication
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to home if already authenticated and trying to access login
  if (pathname === "/login" && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

/**
 * Configure which routes the middleware should run on
 *
 * The middleware is only applied to protected routes and the login page,
 * avoiding unnecessary execution on unrelated paths for better performance.
 */
export const config = {
  matcher: [
    // Protected routes (and their subpaths)
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    // Login route (to redirect authenticated users away from it)
    "/login",
  ],
};
