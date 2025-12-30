import { getSession } from "next-auth/react";

/**
 * Gets the fresh Google OAuth access token from NextAuth session
 * This ensures we always use the latest token (auto-refreshed if expired)
 *
 * @returns {Promise<string|null>} The access token or null if not available
 */
export async function getAccessToken() {
    try {
        // Get the current NextAuth session
        const session = await getSession();

        if (!session || !session.accessToken) {
            console.error('No session or access token available');
            return null;
        }

        // Check if there was an error refreshing the token
        if (session.error === 'RefreshAccessTokenError') {
            console.error('Access token refresh failed - user needs to re-authenticate');
            return null;
        }

        // Update localStorage with the fresh token
        localStorage.setItem('accessToken', session.accessToken);
        localStorage.setItem('session', JSON.stringify(session));

        return session.accessToken;
    } catch (error) {
        console.error('Error getting access token:', error);
        return null;
    }
}

/**
 * Gets the access token synchronously from localStorage
 * WARNING: This may return a stale token. Use getAccessToken() for fresh token.
 *
 * @returns {string|null} The cached access token or null
 */
export function getAccessTokenSync() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
}
