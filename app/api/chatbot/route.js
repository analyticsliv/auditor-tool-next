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
        const { property_id, query } = body;

        // Validate required fields
        if (!property_id || !query) {
            return NextResponse.json(
                { error: 'property_id and query are required' },
                { status: 400 }
            );
        }

        // Get bearer token from environment or session

        const accessToken = request.headers.get("accessToken");

        if (!accessToken) {
            return NextResponse.json(
                { error: 'Bearer token not configured' },
                { status: 500 }
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