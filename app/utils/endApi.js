import { useAccountStore } from "../store/useAccountStore";
import { getSession } from "next-auth/react";

export async function reportEndApiCall(key, endapiall) {
    if (typeof window === "undefined") return;

    try {
        const { selectedProperty, propertyId, setEndApiData } = useAccountStore.getState();

        // Get fresh session and access token
        const session = await getSession();

        if (!session || !session.accessToken) {
            console.error("No session or access token available");
            alert("Session expired. Please refresh the page and try again.");
            return;
        }

        const accessToken = session.accessToken;

        // Update localStorage with fresh token
        localStorage.setItem("accessToken", accessToken);

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

        // Get fresh session and access token
        const session = await getSession();

        if (!session || !session.accessToken) {
            console.error("No session or access token available");
            alert("Session expired. Please refresh the page and try again.");
            return;
        }

        const accessToken = session.accessToken;

        // Update localStorage with fresh token
        localStorage.setItem("accessToken", accessToken);

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
