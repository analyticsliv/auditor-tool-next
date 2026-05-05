"use client";

import { useState, useEffect, useCallback } from 'react';

export function useUsage(autoFetch = true) {
    const [usage, setUsage] = useState(null);
    const [loading, setLoading] = useState(autoFetch);
    const [error, setError] = useState(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/usage', { method: 'GET', credentials: 'include' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to load usage');
            setUsage(data);
            return data;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (autoFetch) refetch();
    }, [autoFetch, refetch]);

    return { usage, loading, error, refetch };
}
