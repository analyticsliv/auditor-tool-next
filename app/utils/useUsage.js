"use client";

import { useEffect, useCallback } from "react";
import { useUsageStore } from "../store/useUsageStore";

/* Backed by the shared usage store so this hook never triggers a duplicate
   /api/usage request. Concurrent hook subscribers share the same in-flight
   fetch; subsequent mounts read straight from the cache. */
export function useUsage(autoFetch = true) {
    const usage = useUsageStore((s) => s.usage);
    const loading = useUsageStore((s) => s.loading);
    const error = useUsageStore((s) => s.error);
    const fetchUsage = useUsageStore((s) => s.fetchUsage);

    const refetch = useCallback(() => fetchUsage(true), [fetchUsage]);

    useEffect(() => {
        if (autoFetch) fetchUsage();
    }, [autoFetch, fetchUsage]);

    return { usage, loading, error, refetch };
}
