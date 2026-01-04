import { useAccountStore } from "../store/useAccountStore";
import { getUserSession } from "./user";

export async function saveAudit(accountId, propertyId, selectedAccount, selectedProperty, isEcommerce, analyzerData = null) {
    const { auditData, endApiData } = useAccountStore.getState();

    const accessToken = localStorage.getItem('accessToken');

    const data = {
        "accountId": accountId,
        "propertyId": propertyId,
        "auditData": auditData,
        "endApiData": endApiData,
        "accountName": selectedAccount?.displayName,
        "propertyName": selectedProperty?.displayName,
        "isEcommerce": isEcommerce,
        "analyzerData": analyzerData,
    }

    const user = getUserSession();

    try {
        const apiUrl = `/api/audit`

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
                'auth-email': user?.user?.email,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to save audit');
        }

        const responseData = await response.json();

        return {
            success: true,
            data: responseData
        };
    } catch (err) {
        console.error('❌ Error saving audit:', err.message);
        return {
            success: false,
            error: err.message
        };
    }
}