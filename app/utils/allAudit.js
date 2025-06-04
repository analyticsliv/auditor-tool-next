import { getUserSession } from "./user";

export async function AllAudit() {
    const accessToken = localStorage.getItem('accessToken');
    try {
        const user = getUserSession();

        const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/audit`;

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
                'auth-email': user?.user?.email,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to get audits');
        }

        const responseData = await response.json();
        return responseData; // <-- Important
    } catch (error) {
        console.error('Error fetching audits:', error.message);
        return [];
    }
}
