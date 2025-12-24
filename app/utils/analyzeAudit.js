import { useAccountStore } from "../store/useAccountStore";

export async function analyzeAudit(auditData) {
    const accessToken = localStorage.getItem('accessToken');

    // Extract the audit object from the response
    const rawData = auditData?.audit || auditData;

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