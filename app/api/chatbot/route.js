import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request) {
    try {
        // getServerSession runs the jwt callback in authOptions which refreshes
        // the access token if it's within 60s of expiry — so session.accessToken
        // here is ALWAYS the freshest copy server-side has.
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // If the jwt callback failed to refresh (e.g. revoked refresh token),
        // it sets session.error and leaves the stale accessToken on the
        // session. Block the call and let the client trigger re-auth.
        if (session.error === 'RefreshAccessTokenError') {
            return NextResponse.json(
                { error: 'Session expired. Please sign in again.', code: 'RefreshAccessTokenError' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { property_id, query } = body;

        if (!property_id || !query) {
            return NextResponse.json(
                { error: 'property_id and query are required' },
                { status: 400 }
            );
        }

        // Use the client-supplied header as the primary source — this matches
        // production behaviour. The client just called getSession() before
        // firing the request, so the header carries the token that the jwt
        // callback (with its 60s refresh buffer) just produced. session.accessToken
        // from getServerSession() is a defensive fallback if the header is
        // missing for some reason.
        const accessToken = request.headers.get("accessToken") || session.accessToken;

        if (!accessToken) {
            return NextResponse.json(
                { error: 'No access token available' },
                { status: 401 }
            );
        }

        // Call the external chatbot API
        const chatbotResponse = await fetch(
            'https://auditor-tool-ai-135392845747.europe-west1.run.app/audit/chatbot',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    property_id: property_id,
                    raw: {
                        query: query
                    }
                })
            }
        );

        if (!chatbotResponse.ok) {
            const errorData = await chatbotResponse.json().catch(() => ({}));
            console.error('❌ Chatbot API error:', errorData);
            throw new Error(errorData.message || 'Chatbot API request failed');
        }

        const data = await chatbotResponse.json();

        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        console.error('Chatbot API error:', error);
        return NextResponse.json(
            {
                error: 'Failed to process chatbot request',
                details: error.message
            },
            { status: 500 }
        );
    }
}