import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request) {
    try {
        // Get user session for authentication
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { raw } = body;

        // Validate required fields
        if (!raw) {
            return NextResponse.json(
                { error: 'raw data is required' },
                { status: 400 }
            );
        }

        // Get bearer token from request headers
        const accessToken = request.headers.get("Authorization")?.replace("Bearer ", "");

        if (!accessToken) {
            return NextResponse.json(
                { error: 'Access token not provided' },
                { status: 500 }
            );
        }

        // Call the external analyzer API
        const analyzerResponse = await fetch(
            'https://auditor-tool-ai-135392845747.europe-west1.run.app/audit/analyzer',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    raw: raw
                })
            }
        );

        if (!analyzerResponse.ok) {
            const errorData = await analyzerResponse.json().catch(() => ({}));
            console.error('❌ Analyzer API error:', errorData);
            throw new Error(errorData.message || 'Analyzer API request failed');
        }

        const data = await analyzerResponse.json();

        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        console.error('Analyzer API error:', error);
        return NextResponse.json(
            {
                error: 'Failed to process analyzer request',
                details: error.message
            },
            { status: 500 }
        );
    }
}