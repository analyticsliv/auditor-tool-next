import { useState } from 'react';
import { getSession, signIn } from 'next-auth/react';

export const useChatbot = (onUsageRefetch) => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [limitReached, setLimitReached] = useState(false);
    const [limitInfo, setLimitInfo] = useState(null);

    const sendMessage = async (query, propertyId) => {
        if (!query.trim() || !propertyId) return;

        // Lock the UI IMMEDIATELY — before any network round-trip.
        // Previously isLoading was only set after the pre-check quota fetch,
        // which made suggested-question clicks feel laggy.
        setIsLoading(true);
        setError(null);

        // Optimistically add the user message right away so the question
        // shows in the chat the moment the click registers.
        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: query,
            timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, userMessage]);

        const session = await getSession();
        const accessToken = session?.accessToken;
        const email = session?.user?.email;

        const refetch = () => { if (typeof onUsageRefetch === 'function') onUsageRefetch(); };

        // Auth guard — if next-auth couldn't refresh the access token (or
        // there's no token at all) the chatbot API would 401 silently and
        // the user would have to manually log out / log in. Force a fresh
        // sign-in so the UI self-heals instead.
        if (!session || session.error === 'RefreshAccessTokenError' || !accessToken) {
            const errorMessage = {
                id: Date.now() + 1,
                type: 'error',
                content: 'Your Google session expired. Reconnecting…',
                timestamp: new Date().toISOString(),
            };
            setMessages(prev => [...prev, errorMessage]);
            setIsLoading(false);
            // Re-run the OAuth flow with the same scopes; on return the user
            // lands back here with a fresh token.
            signIn('google', { callbackUrl: typeof window !== 'undefined' ? window.location.pathname : '/home' });
            return;
        }

        if (!email) {
            setIsLoading(false);
            return;
        }

        // Pre-check quota
        try {
            const checkRes = await fetch('/api/chatbot-count?action=check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const checkData = await checkRes.json();
            if (checkData.hasReachedLimit) {
                setLimitReached(true);
                setLimitInfo({
                    chatbotCount: checkData.chatbotCount,
                    chatbotLimit: checkData.chatbotLimit,
                });
                refetch();
                setIsLoading(false);
                return;
            }
        } catch (e) {
            console.error('Chatbot quota check failed', e);
        }

        try {
            const response = await fetch('/api/chatbot', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                    accessToken: `${accessToken}`,
                },
                body: JSON.stringify({ property_id: propertyId, query }),
            });

            if (response.status === 401) {
                // Server refused — most likely because session.error === 'RefreshAccessTokenError'
                // (see /api/chatbot/route.js). Re-run OAuth and let the user retry.
                const errBody = await response.json().catch(() => ({}));
                if (errBody.code === 'RefreshAccessTokenError') {
                    setIsLoading(false);
                    signIn('google', { callbackUrl: typeof window !== 'undefined' ? window.location.pathname : '/home' });
                    return;
                }
                throw new Error(errBody.error || 'Unauthorized');
            }
            if (!response.ok) throw new Error('Failed to get response from chatbot');
            const data = await response.json();

            const botMessage = {
                id: Date.now() + 1,
                type: 'bot',
                content: data.insights || data.response || data.answer || 'No response received',
                data,
                timestamp: new Date().toISOString(),
                recommendedQuestions: data.recommended_followup_questions || [],
            };
            setMessages(prev => [...prev, botMessage]);

            // Increment quota only after a successful response
            try {
                const incRes = await fetch('/api/chatbot-count?action=increment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email,
                        metadata: { propertyId, queryPreview: String(query).slice(0, 200) },
                    }),
                });
                const incData = await incRes.json();
                if (incData.hasReachedLimit) {
                    setLimitInfo({
                        chatbotCount: incData.chatbotCount,
                        chatbotLimit: incData.chatbotLimit,
                    });
                }
            } catch (e) {
                console.error('Chatbot increment failed', e);
            }
        } catch (err) {
            console.error('Chatbot error:', err);
            setError(err.message);
            const errorMessage = {
                id: Date.now() + 1,
                type: 'error',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date().toISOString(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            // Always refresh usage at the end of the call — success, error, or limit hit
            refetch();
            setIsLoading(false);
        }
    };

    const clearMessages = () => {
        setMessages([]);
        setError(null);
    };

    const dismissLimit = () => setLimitReached(false);

    return {
        messages,
        isLoading,
        error,
        sendMessage,
        clearMessages,
        limitReached,
        limitInfo,
        dismissLimit,
    };
};
