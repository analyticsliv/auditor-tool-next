import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const propertyId = searchParams.get("propertyId");
        const path = searchParams.get("path");
        const accessToken = req.headers.get("accessToken");

        console.log("prop --",propertyId,path)
        if (!accessToken) {
            return NextResponse.json({ error: "Access token is missing" }, { status: 401 });
        }
        if (!propertyId || !path) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        const response = await fetch(
            `https://analyticsadmin.googleapis.com/v1alpha/properties/${propertyId}/${path}`,
            {
                headers: {
                    "Authorization": `Bearer ${accessToken}`
                }
            }
        );

        console.log("post auitdata --",response)

        if (!response.ok) {
            return NextResponse.json({ error: "Failed to fetch audit data" }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching Data Streams:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
