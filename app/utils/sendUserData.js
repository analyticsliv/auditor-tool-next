export async function sendUserData(userDetail, accountSummaries) {
    // Function to transform the input array
    function transformAccounts(inputArray) {
        return inputArray?.map(account => {
            const accountId = account?.account?.replace('accounts/', '');
            const properties = account?.propertySummaries?.map(property => ({
                propertyId: property?.property?.replace('properties/', ''),
                name: property?.displayName
            }));
            return {
                accountId: accountId,
                displayName: account?.displayName,
                properties: properties
            };
        });
    }

    // array of accounts in formatted form in which format i have to save in db
    const transformedArray = transformAccounts(accountSummaries);

    // Support both old format (userDetail.given_name.user) and new format (userDetail directly)
    const email = userDetail?.email || userDetail?.given_name?.user?.email;
    const name = userDetail?.name || userDetail?.given_name?.user?.name;

    console.log("📧 Sending user data:", { email, name, accountCount: transformedArray?.length });

    if (!email) {
        console.error("❌ No email found in userDetail:", userDetail);
        throw new Error("Email is required to save user data");
    }

    let userData = {
        "email": email,
        "name": name,
        "accounts": transformedArray
    };
    const accessToken = localStorage.getItem("accessToken");
    try {
        const apiUrl = `/api/user`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            let errorData = {};
            try {
                errorData = await response.json();
            } catch (e) {
                console.error('No JSON body to parse:', e.message);
            }

            console.error('API Error:', errorData);
            return new Response(
                JSON.stringify({ error: errorData?.error || 'External API error' }),
                { status: response.status }
            );
        }


        const responseData = await response.json();

        // Return the response data
        return responseData;
    } catch (error) {
        console.error('Error adding or updating user:', error.message);
        throw error;
    }
}