"use client";

import { create } from "zustand";

/* Single source of truth for /api/usage. Multiple hooks (useRole, useUsage,
   future ones) all subscribe to this store, so the endpoint is hit at most
   once per session restoration even when several components mount in the
   same render. The module-level `inflight` Promise also coalesces concurrent
   calls — if two effects fire on the same tick, they share one network call. */

let inflight = null;

export const useUsageStore = create((set, get) => ({
    usage: null,        // raw API payload
    role: null,
    agencyId: null,
    loading: true,
    error: null,
    fetched: false,     // becomes true after the first response (success or fail)

    fetchUsage: async (force = false) => {
        const state = get();
        if (!force && state.fetched) return state.usage;
        if (inflight) return inflight;
        set({ loading: true, error: null });
        inflight = (async () => {
            try {
                const res = await fetch("/api/usage", {
                    credentials: "include",
                    cache: "no-store",
                });
                if (!res.ok) throw new Error(`Usage fetch failed (${res.status})`);
                const data = await res.json();
                set({
                    usage: data,
                    role: data.role || null,
                    agencyId: data.agencyId || null,
                    loading: false,
                    fetched: true,
                    error: null,
                });
                return data;
            } catch (e) {
                set({
                    usage: null,
                    role: null,
                    agencyId: null,
                    loading: false,
                    fetched: true,
                    error: e.message,
                });
                return null;
            } finally {
                inflight = null;
            }
        })();
        return inflight;
    },

    reset: () => {
        inflight = null;
        set({ usage: null, role: null, agencyId: null, loading: true, error: null, fetched: false });
    },
}));
