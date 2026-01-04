import { useState } from 'react';

export const useChatbot = () => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const accessToken = localStorage.getItem('accessToken');

    const sendMessage = async (query, propertyId) => {
        if (!query.trim() || !propertyId) return;

        // Add user message
        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: query,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMessage]);

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/chatbot', {
                method: 'POST',
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`,
                    "accessToken": `${accessToken}`
                },
                body: JSON.stringify({
                    property_id: propertyId,
                    query: query
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get response from chatbot');
            }

            const data = await response.json();

            // Add bot message
            const botMessage = {
                id: Date.now() + 1,
                type: 'bot',
                content: data.insights || data.response || data.answer || 'No response received',
                data: data,
                timestamp: new Date().toISOString(),
                recommendedQuestions: data.recommended_followup_questions || []
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (err) {
            console.error('Chatbot error:', err);
            setError(err.message);

            // Add error message
            const errorMessage = {
                id: Date.now() + 1,
                type: 'error',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date().toISOString()
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

    return {
        messages,
        isLoading,
        error,
        sendMessage,
        clearMessages
    };
};