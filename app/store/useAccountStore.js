import { create } from "zustand";
import moment from "moment";
import { signOut, getSession } from "next-auth/react";
import { sendUserData } from "../utils/sendUserData";
import { toast } from "./useToastStore";

/* Module-level guard so concurrent callers (e.g. home page + chatbot modal
   mounting at the same time) share a single in-flight fetch instead of
   firing the GA4 admin API twice. */
let inflightAccountsFetch = null;

export const useAccountStore = create((set, get) => ({
    accounts: [],
    properties: [],
    selectedAccount: null,
    selectedProperty: null,
    accountSelected: false,
    propertySelected: false,
    accountId: null,
    propertyId: null,
    auditData: {},
    endApiData: {},
    analyzerData: null,
    loading: false,
    hasFetchedAccounts: false,
    readyToRunAudit: false,
    auditCompleted: false,
    auditRunCompleted: false,
    accountNameFromAudit: null,
    accountIdFromAudit: null,
    propertyNameFromAudit: null,
    propertyIdFromAudit: null,
    isEcommerce: false,

    setAccountDetailsFromAudit: ({ accountName, accountId, propertyName, propertyId }) =>
        set({
            accountNameFromAudit: accountName,
            accountIdFromAudit: accountId,
            propertyNameFromAudit: propertyName,
            propertyIdFromAudit: propertyId,
        }),

    setIsEcommerce: (value) => set({ isEcommerce: value }),
    setAuditRunCompleted: (val) => set({ auditRunCompleted: val }),
    setReadyToRunAudit: (val) => set({ readyToRunAudit: val }),
    setAuditCompleted: (val) => set({ auditCompleted: val }),

    setLoading: (isLoading) => set({ loading: isLoading }),

    setAnalyzerData: (data) => set({ analyzerData: data }),

    dateRange: {
        startDate: moment().subtract(31, "days").format("YYYY-MM-DD"),
        endDate: moment().subtract(2, "days").format("YYYY-MM-DD"),
    },

    // Function to update dateRange when user picks new dates
    setDateRange: (startDate, endDate) =>
        set(() => ({ dateRange: { startDate, endDate } })),

    fetchAccountSummaries: async (userData, router) => {
        if (get().hasFetchedAccounts) return;

        // Get fresh session and access token
        const session = await getSession();

        console.log("📊 Session status:", {
            hasSession: !!session,
            hasAccessToken: !!session?.accessToken,
            hasUser: !!session?.user,
            error: session?.error
        });

        if (!session) {
            console.error("❌ No session found");
            toast.error("Session expired. Please sign in again.");
            router.push("/");
            return;
        }

        if (!session.accessToken || session.error === 'RefreshAccessTokenError') {
            console.error("❌ Access token missing or refresh failed:", session.error);
            toast.error("Your session has expired. Please sign in again.");
            await signOut({ redirect: false });
            router.push("/");
            return;
        }

        const accessToken = session.accessToken;
        console.log("✅ Using access token (first 20 chars):", accessToken.substring(0, 20) + "...");

        // Update localStorage with fresh token
        localStorage.setItem("session", JSON.stringify(session));

        set({ loading: true });

        try {
            console.log("🔄 Fetching account summaries from Google Analytics API...");

            const response = await fetch(
                "https://analyticsadmin.googleapis.com/v1alpha/accountSummaries?pageSize=200",
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("❌ Failed to fetch account summaries:", {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorData
                });
                toast.error(`Failed to fetch account summaries (${response.status}). Please try signing in again.`);
                set({ loading: false });
                return;
            }

            console.log("✅ Successfully fetched account summaries");

            const data = await response.json();
            const accountSummaries = data?.accountSummaries || [];

            // Pass session user data (email, name) to sendUserData
            const userDataForSave = {
                email: session.user?.email,
                name: session.user?.name
            };

            sendUserData(userDataForSave, accountSummaries);

            set({ accounts: accountSummaries, hasFetchedAccounts: true });

            if (accountSummaries.length === 0) {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("session");
                await signOut({ redirect: false });
                toast.error(`No GA4 accounts are associated with this email.`);

                router.push("/");
            }
        } catch (error) {
            console.error("Error:", error);
            set({ loading: false });
        } finally {
            set({ loading: false });
        }
    },

    /* ============================================================
       ensureAccountsFetched
       Non-destructive variant of fetchAccountSummaries used from places
       OTHER than /home (e.g. the chatbot modal opened from any page).
       - Returns { ok: true, accounts } when cache is warm or fetch succeeds.
       - Returns { ok: false, reason } on auth failure / fetch error / empty.
       - Never signs the user out or navigates them anywhere — callers
         decide how to surface failures in their own UI.
       - Coalesces concurrent calls via a module-level in-flight promise.
       ============================================================ */
    ensureAccountsFetched: async () => {
        if (get().hasFetchedAccounts) {
            return { ok: true, accounts: get().accounts };
        }
        if (inflightAccountsFetch) return inflightAccountsFetch;

        inflightAccountsFetch = (async () => {
            try {
                const session = await getSession();
                if (!session) return { ok: false, reason: 'no-session' };
                if (session.error === 'RefreshAccessTokenError' || !session.accessToken) {
                    return { ok: false, reason: 'auth' };
                }
                const response = await fetch(
                    "https://analyticsadmin.googleapis.com/v1alpha/accountSummaries?pageSize=200",
                    { headers: { Authorization: `Bearer ${session.accessToken}` } }
                );
                if (!response.ok) {
                    return { ok: false, reason: 'fetch', status: response.status };
                }
                const data = await response.json();
                const accountSummaries = data?.accountSummaries || [];
                set({ accounts: accountSummaries, hasFetchedAccounts: true });
                if (accountSummaries.length === 0) {
                    return { ok: false, reason: 'empty', accounts: [] };
                }
                return { ok: true, accounts: accountSummaries };
            } catch (e) {
                console.error('ensureAccountsFetched error', e);
                return { ok: false, reason: 'error', message: e?.message };
            }
        })();

        try {
            return await inflightAccountsFetch;
        } finally {
            inflightAccountsFetch = null;
        }
    },

    fetchPropertySummaries: async (accountName) => {
        // Get fresh session and access token
        const session = await getSession();

        if (!session || !session.accessToken) {
            console.error("No session or access token available");
            return [];
        }

        const accessToken = session.accessToken;

        // Update localStorage with fresh token
        try {
            const response = await fetch(
                `https://analyticsadmin.googleapis.com/v1alpha/properties?filter=parent:${accountName}`,
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Failed to fetch property summaries:", errorData);
                throw new Error("Failed to fetch property summaries");
            }

            const propertiesData = await response.json();
            set({ properties: propertiesData.properties || [] });
            return propertiesData.properties || [];
        } catch (error) {
            console.error("Error fetching Property Summaries:", error);
            return [];
        }
    },

    selectAccount: (account) =>
        set({
            selectedAccount: account,
            accountId: account?.account.replace("accounts/", ""),
            accountSelected: true,
            properties: [],
            selectedProperty: null,
            propertySelected: false,
        }),

    selectProperty: (property) =>
        set({
            selectedProperty: property,
            propertyId: property?.name.replace("properties/", ""),
            propertySelected: true,
        }),

    // setAuditData: (data) => set({ auditData: data }),
    setAuditData: (key, data) =>
        set((state) => ({
            auditData: {
                ...state.auditData,
                [key]: data,
            },
        })),
    setEndApiData: (key, data) =>
        set((state) => ({
            endApiData: {
                ...state.endApiData,
                [key]: data,
            },
        })),
    // setEndApiData: (data) => set({ endApiData: data }),

    resetSelection: () =>
        set({
            accounts: [],
            properties: [],
            selectedAccount: null,
            selectedProperty: null,
            accountSelected: false,
            propertySelected: false,
            accountId: null,
            propertyId: null,
            hasFetchedAccounts: false,
            auditData: {},
            endApiData: {},
            analyzerData: null,
            loading: false,
            readyToRunAudit: false,
            auditCompleted: false,
            auditRunCompleted: false,
            isEcommerce: false,
        }),
}));