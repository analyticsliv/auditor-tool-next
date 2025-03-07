import { create } from 'zustand';

export const useAccountStore = create((set) => ({
    accounts: [],
    properties: [],
    selectedAccount: null,
    selectedProperty: null,
    accountSelected: false,
    propertySelected: false,
    accountId: null,
    propertyId: null,
    auditData: null,

    fetchAccountSummaries: async (userData) => {
        const accessToken = localStorage.getItem('accessToken');

        try {
            const response = await fetch("https://analyticsadmin.googleapis.com/v1alpha/accountSummaries?pageSize=200", {
                headers: { "Authorization": `Bearer ${accessToken}` }
            });

            if (!response.ok) alert('Failed to fetch account summaries');

            const data = await response.json();
            const accountSummaries = data?.accountSummaries || [];

            set({ accounts: accountSummaries });

            if (accountSummaries.length === 0) {
                alert(`Hey ${userData?.given_name?.user?.name}, no accounts associated with this email.`);
            }
        } catch (error) {
            console.error('Error:', error);
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

    setAuditData: (data) => set({ auditData: data }),

    resetSelection: () => set({
        selectedAccount: null,
        selectedProperty: null,
        accountSelected: false,
        propertySelected: false,
        accountId: null,
        propertyId: null
    })

}));