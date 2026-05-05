import { useState } from 'react';
import { getSession } from 'next-auth/react';

export const useChatbot = (onUsageRefetch) => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [limitReached, setLimitReached] = useState(false);
    const [limitInfo, setLimitInfo] = useState(null);

    const sendMessage = async (query, propertyId) => {
        const session = await getSession();
        const accessToken = session?.accessToken;
        const email = session?.user?.email;
        if (!query.trim() || !propertyId || !email) return;

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
                return;
            }
        } catch (e) {
            console.error('Chatbot quota check failed', e);
        }

        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: query,
            timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, userMessage]);

        setIsLoading(true);
        setError(null);

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
                if (typeof onUsageRefetch === 'function') onUsageRefetch();
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
