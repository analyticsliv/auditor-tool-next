import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// import { fetchAccountSummaries, fetchPropertySummaries } from '../utils/accountAndProperty';

export const useAccountStore = create(
    persist(
        (set, get) => ({
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

            setLoading: (isLoading) => set({ loading: isLoading }),

            fetchAccountSummaries: async (userData) => {

                if (get().hasFetchedAccounts) return;

                const accessToken = localStorage.getItem('accessToken');

                set({ loading: true })

                try {
                    const response = await fetch("https://analyticsadmin.googleapis.com/v1alpha/accountSummaries?pageSize=200", {
                        headers: { "Authorization": `Bearer ${accessToken}` }
                    });

                    if (!response.ok) {
                        alert('Failed to fetch account summaries');
                        set({ loading: false })
                    };

                    const data = await response.json();
                    const accountSummaries = data?.accountSummaries || [];

                    set({ accounts: accountSummaries, hasFetchedAccounts: true });

                    if (accountSummaries.length === 0) {
                        alert(`Hey ${userData?.given_name?.user?.name}, no accounts associated with this email.`);
                    }
                } catch (error) {
                    console.error('Error:', error);
                    set({ loading: false })
                } finally {
                    set({ loading: false })
                }
            },

            fetchPropertySummaries: async (accountName) => {
                const accessToken = localStorage.getItem('accessToken');
                try {
                    const response = await fetch(`https://analyticsadmin.googleapis.com/v1alpha/properties?filter=parent:${accountName}`, {
                        headers: { "Authorization": `Bearer ${accessToken}` }
                    });

                    if (!response.ok) throw new Error('Failed to fetch property summaries');

                    const propertiesData = await response.json();
                    set({ properties: propertiesData.properties || [] });
                } catch (error) {
                    console.error('Error fetching Property Summaries:', error);
                }
            },

            selectAccount: (account) => set({
                selectedAccount: account,
                accountId: account?.account.replace('accounts/', ''),
                accountSelected: true,
                properties: [],
                selectedProperty: null,
                propertySelected: false
            }),

            selectProperty: (property) => set({
                selectedProperty: property,
                propertyId: property?.name.replace('properties/', ''),
                propertySelected: true
            }),

            // setAuditData: (data) => set({ auditData: data }),
            setAuditData: (key, data) => set((state) => ({
                auditData: {
                    ...state.auditData,
                    [key]: data
                }
            })),
            setEndApiData: (key, data) => set((state) => ({
                endApiData: {
                    ...state.endApiData,
                    [key]: data
                }
            })),
            // setEndApiData: (data) => set({ endApiData: data }),

            resetSelection: () => set({
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
            })

        }),
        {
            name: 'account-store', // Key for localStorage
            getStorage: () => localStorage, // Use localStorage for persistence
        }
    )
);



// setAccountsData: (data) => set({ accountsData: data }),
// setPropertiesData: (data) => set({ propertiesData: data }),

// loadAccounts: async (token) => {
//     set({ loading: true });
//     const accounts = await fetchAccountSummaries(token);
//     set({ accounts, loading: false });
// },

// loadProperties: async (accountName, token) => {
//     set({ loading: true });
//     const properties = await fetchPropertySummaries(accountName, token);
//     set({ properties, loading: false });
// },