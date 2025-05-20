import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const body = await req.json();
        const { propertyId, data } = body;
        const accessToken = req.headers.get("accessToken");

        if (!accessToken) {
            return NextResponse.json({ error: "Access token is missing" }, { status: 401 });
        }
        if (!propertyId) {
            return NextResponse.json({ error: "Property ID is missing" }, { status: 400 });
        }

        const response = await fetch(
            `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
            {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`,
                },
                body: JSON.stringify(data),
            }
        );
        console.log("response report end--",response, 'data--',data)

        if (!response.ok) {
            return NextResponse.json({ error: "Failed to fetch report" }, { status: response.status });
        }

        const responseData = await response.json();
        return NextResponse.json(responseData);
    } catch (error) {
        console.error("Error in reportEndApiCall:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
