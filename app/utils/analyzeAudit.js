import { useAccountStore } from "../store/useAccountStore";

export async function analyzeAudit(accountId, propertyId, selectedAccount, selectedProperty, isEcommerce) {
    const accessToken = localStorage.getItem('accessToken');
    const { auditData, endApiData } = useAccountStore.getState();

    const rawData = {
        accountId: accountId,
        propertyId: propertyId,
        auditData: auditData,
        endApiData: endApiData,
        accountName: selectedAccount?.displayName,
        propertyName: selectedProperty?.displayName,
        isEcommerce: isEcommerce,
    };

    try {
        const apiUrl = `/api/analyzer`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                raw: rawData
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Analyzer API error:', errorData);
            throw new Error(errorData.error || 'Failed to analyze audit');
        }

        const responseData = await response.json();

        return {
            success: true,
            data: responseData
        };

    } catch (err) {
        console.error('❌ Error calling analyzer:', err.message);
        return {
            success: false,
            error: err.message
        };
    }
}