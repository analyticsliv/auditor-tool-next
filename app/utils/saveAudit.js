import { useAccountStore } from "../store/useAccountStore";
import { getUserSession } from "./user";

export async function saveAudit(accountId, propertyId, selectedAccount, selectedProperty, isEcommerce) {
    // const { auditData, endApiData } = useAccountStore.getState();
    // selectedAccount?.displayName

    const {auditData, endApiData} = useAccountStore.getState();

    const accessToken = localStorage.getItem('accessToken');

    const data = {
        "accountId": accountId,
        "propertyId": propertyId,
        "auditData": auditData,
        "endApiData": endApiData,
        "accountName": selectedAccount?.displayName,
        "propertyName": selectedProperty?.displayName,
        "isEcommerce": isEcommerce,
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

        const responseData = response.json();
    } catch (err) {
        console.error('Error adding or updating user:', err.message);
        throw err;
    }
}