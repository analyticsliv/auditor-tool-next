import { useAccountStore } from "../store/useAccountStore";

export async function reportEndApiCall(key, endapiall) {
    if (typeof window === "undefined") return;

    try {
        const { selectedProperty, propertyId, setEndApiData } = useAccountStore.getState();

        // if (!propertyId || !selectedProperty?.name) {
        //     alert("No property selected");
        //     return;
        // }

        let accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            alert("Access token is missing");
            return;
        }

        const response = await fetch("/api/report-end", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
                "accessToken": `${accessToken}`
            },
            body: JSON.stringify({
                propertyId,
                data: endapiall,
            }),
        });

        if (!response.ok) {
            alert("Network response was not ok");
        }

        const endApiData = await response.json();

        setEndApiData(key, endApiData);

        return endApiData;

        return response;
    } catch (error) {
        console.error("Error in reportEndApiCall:", error);
        throw error;
    }
}

export async function fetchAuditData(key, path) {
    if (typeof window === "undefined") return;

    try {
        const { propertyId, setAuditData } = useAccountStore.getState();
        const accessToken = localStorage.getItem('accessToken');

        // if (!propertyId) {
        //     alert("No property selected");
        //     return;
        // }
        if (!accessToken) {
            alert("Access token is missing");
            return;
        }

        const response = await fetch(`/api/audit-data?propertyId=${propertyId}&path=${path}`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "accessToken": `${accessToken}`
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch data streams");
        }

        const auditData = await response.json();

        setAuditData(key, auditData);

        return auditData;

    } catch (error) {
        console.error("Error fetching Data Streams:", error);
        throw error;
    }
}
