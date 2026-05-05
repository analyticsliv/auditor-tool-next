"use client";

import { useEffect, useState } from 'react';

export function useRole() {
    const [role, setRole] = useState(null);
    const [agencyId, setAgencyId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch('/api/usage', { credentials: 'include' });
                if (!res.ok) throw new Error('not authenticated');
                const data = await res.json();
                if (cancelled) return;
                setRole(data.role || null);
                setAgencyId(data.agencyId || null);
            } catch {
                if (!cancelled) setRole(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    return { role, agencyId, loading };
}
