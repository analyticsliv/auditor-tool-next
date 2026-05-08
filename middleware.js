import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // Public paths that don't require authentication
    const publicPaths = ['/', '/api/auth'];
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

    // Protected page routes — redirect unauthenticated users to "/" (the
    // public landing). The landing page has the Google sign-in CTA.
    if (!isPublicPath && !token) {
        const landing = new URL('/', request.url);
        landing.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(landing);
    }

    // Authenticated users hitting "/" go straight to the app at "/home".
    // (Was previously redirecting "/" → "/" which is an infinite loop now
    // that "/" itself is the public landing page.)
    if (pathname === '/' && token) {
        return NextResponse.redirect(new URL('/home', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/api/audit/:path*',
        '/',
        '/home',
        '/dashboard',
        '/account',
        '/agency',
        '/agency/welcome',
        '/auditPreview',
        '/previous-audit',
        '/previousAudit',
    ]
};