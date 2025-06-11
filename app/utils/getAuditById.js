import { getUserSession } from "./user";

export async function GetAuditById(id) {
    const user = getUserSession();
    const accessToken = localStorage.getItem('accessToken');
    try {
        const apiUrl = `${process.env.NEXTAUTH_URL }/api/audit/${id}`;

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
            throw new Error(errorData.error || 'Failed to get audit detail');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching audit with ID ${id}:`, error.message);
        return null;
    }
}
