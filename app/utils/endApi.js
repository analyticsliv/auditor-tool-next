import { useAccountStore } from "../store/useAccountStore";

export async function reportEndApiCall(endapiall) {
    try {
        const { selectedProperty, propertyId } = useAccountStore.getState();

        if (!propertyId || !selectedProperty?.name) {
            alert("No property selected");
        }

        let accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            alert("Access token is missing");
        }

        const response = await fetch(
            `https://analyticsdata.googleapis.com/v1beta/${propertyId}:runReport`,
            {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`,
                },
                body: JSON.stringify(endapiall),
            }
        );

        if (!response.ok) {
            alert("Network response was not ok");
        }

        return response;
    } catch (error) {
        console.error("Error in reportEndApiCall:", error);
        throw error;
    }
}

export async function fetchAuditData(path) {
    try {
        const { propertyId, setAuditData } = useAccountStore.getState();
        const accessToken = localStorage.getItem('accessToken');

        if (!accessToken || !propertyId) {
            alert("Access token or property is missing");
            return;
        }

        const response = await fetch(
            `https://analyticsadmin.googleapis.com/v1alpha/${propertyId}/${path}`,
            {
                headers: {
                    "Authorization": `Bearer ${accessToken}`
                }
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch data streams');
        }

        const dataStreams = await response.json();

        setAuditData(dataStreams);

        return dataStreams;

    } catch (error) {
        console.error('Error fetching Data Streams:', error);
        throw error;
    }
}
