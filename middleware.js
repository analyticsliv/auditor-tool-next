import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // Public paths that don't require authentication
    const publicPaths = ['/login', '/api/auth'];
    const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

    // Get the NextAuth JWT token
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    });

    // Protect API routes (except auth routes)
    if (pathname.startsWith('/api/audit')) {
        // If no valid session, return 401
        if (!token) {
            return NextResponse.json(
                {
                    message: 'Authentication required',
                    details: ['You must be signed in to access this resource']
                },
                { status: 401 }
            );
        }

        // Check if token has refresh error
        if (token.error === 'RefreshAccessTokenError') {
            return NextResponse.json(
                {
                    message: 'Session expired',
                    details: ['Your session has expired. Please sign in again']
                },
                { status: 401 }
            );
        }

        // Add user email to headers for API routes that need it
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-email', token.email || '');
        requestHeaders.set('x-user-name', token.name || '');

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            }
        });
    }

    // Protect page routes - redirect to login if not authenticated
    if (!isPublicPath && !token) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Redirect authenticated users away from login page
    if (pathname === '/login' && token) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Allow all other requests
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/api/audit/:path*',  // Protect audit API routes
        '/',                   // Protect home page
        '/dashboard',          // Protect dashboard
        '/account',            // Protect account page
        '/auditPreview',       // Protect audit preview
        '/previous-audit',     // Protect previous audit
        '/previousAudit',      // Protect previous audit (alt)
        '/login',              // Handle login redirects
    ]
};