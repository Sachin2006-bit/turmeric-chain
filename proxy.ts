import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Check if the route requires authentication
  const { pathname } = request.nextUrl;
  
  // Define protected routes
  const protectedRoutes = ['/farmer/dashboard', '/buyer/dashboard'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  // Define auth routes
  const authRoutes = ['/auth/login'];
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // For protected routes, redirect to login if not authenticated
  // Note: This is a client-side check, we'll verify authentication in the page components
  // The middleware here is for server-side route protection if needed in the future
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - logo.svg (logo file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|logo.svg).*)',
  ],
};

