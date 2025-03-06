export function getUserSession() {
    if (typeof window !== 'undefined') {
        const userSession = JSON.parse(localStorage.getItem('session'));
        return userSession || 'Guest';
    }
    return null;
}