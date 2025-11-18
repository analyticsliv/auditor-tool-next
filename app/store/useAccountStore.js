import { create } from "zustand";
import { persist } from "zustand/middleware";
import moment from "moment";
import { signOut } from "next-auth/react";
import { sendUserData } from "../utils/sendUserData";

// import { fetchAccountSummaries, fetchPropertySummaries } from '../utils/accountAndProperty';

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

    dateRange: {
        startDate: moment().subtract(31, "days").format("YYYY-MM-DD"),
        endDate: moment().subtract(2, "days").format("YYYY-MM-DD"),
    },

    // Function to update dateRange when user picks new dates
    setDateRange: (startDate, endDate) =>
        set(() => ({ dateRange: { startDate, endDate } })),

    fetchAccountSummaries: async (userData, router) => {
        if (get().hasFetchedAccounts) return;

        const accessToken = localStorage.getItem("accessToken");

        set({ loading: true });

        try {
            const response = await fetch(
                "https://analyticsadmin.googleapis.com/v1alpha/accountSummaries?pageSize=200",
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );

            if (!response.ok) {
                alert("Failed to fetch account summaries");
                set({ loading: false });
            }

            const data = await response.json();
            const accountSummaries = data?.accountSummaries || [];

            sendUserData(userData, accountSummaries);

            set({ accounts: accountSummaries, hasFetchedAccounts: true });

            if (accountSummaries.length === 0) {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("session");
                await signOut({ redirect: false });
                alert(
                    `Hey ${userData?.given_name?.user?.name}, no accounts associated with this email.`
                );

                router.push("/login");
            }
        } catch (error) {
            console.error("Error:", error);
            set({ loading: false });
        } finally {
            set({ loading: false });
        }
    },

    fetchPropertySummaries: async (accountName) => {
        const accessToken = localStorage.getItem("accessToken");
        try {
            const response = await fetch(
                `https://analyticsadmin.googleapis.com/v1alpha/properties?filter=parent:${accountName}`,
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );

            if (!response.ok) throw new Error("Failed to fetch property summaries");

            const propertiesData = await response.json();
            set({ properties: propertiesData.properties || [] });
        } catch (error) {
            console.error("Error fetching Property Summaries:", error);
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
            loading: false,
            readyToRunAudit: false,
            auditCompleted: false,
            auditRunCompleted: false,
            isEcommerce: false,
        }),
}));