import { NextResponse } from 'next/server';

export async function middleware(request) {
    // Only apply middleware to audit API routes
    if (request.nextUrl.pathname.startsWith('/api/audit')) {
        
        const authHeader = request.headers.get('authorization');
        const Email = request.headers.get('email');

        if (!authHeader && !Email) {
            return NextResponse.json({ 
                message: 'Authorization token required' 
            }, { status: 401 });
        }

        const token = authHeader?.split(' ')[1];

        if (!token && !Email) {
            return NextResponse.json({ 
                message: 'Token missing from Authorization header' 
            }, { status: 401 });
        }

        // Pass authentication data to API routes for verification
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('auth-token', token || '');
        requestHeaders.set('auth-email', Email || '');

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            }
        });
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // '/api/audit/:path*'  // Only protect audit routes
    ]
};