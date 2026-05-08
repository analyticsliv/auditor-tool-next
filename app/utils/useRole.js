"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useUsageStore } from "../store/useUsageStore";

export function useRole() {
    const { status } = useSession();
    const role = useUsageStore((s) => s.role);
    const agencyId = useUsageStore((s) => s.agencyId);
    const loading = useUsageStore((s) => s.loading);
    const fetched = useUsageStore((s) => s.fetched);
    const fetchUsage = useUsageStore((s) => s.fetchUsage);
    const reset = useUsageStore((s) => s.reset);

    useEffect(() => {
        if (status === "authenticated") {
            // fetchUsage is idempotent — won't refetch if already fetched.
            fetchUsage();
        } else if (status === "unauthenticated") {
            // Drop cached data when the user logs out so the next sign-in
            // re-fetches against the new identity.
            if (fetched) reset();
        }
        // status === "loading" → wait, no-op
    }, [status, fetchUsage, reset, fetched]);

    return { role, agencyId, loading };
}
