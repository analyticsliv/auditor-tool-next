// lib/auth.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "../app/api/auth/[...nextauth]/route";
import connectDB from './mongodb';
import User from '../models/user';

/**
 * Authenticates user using NextAuth session
 * This is the secure way to verify authentication
 *
 * @param {Request} request - The incoming request object
 * @returns {Promise<{user: Object, session: Object}>} Authenticated user and session
 * @throws {Error} If authentication fails
 */
export async function authenticateUser(request) {
    await connectDB();

    // Get NextAuth session from the request
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        const error = new Error('Authentication required');
        error.status = 401;
        error.details = ["You must be signed in to access this resource"];
        throw error;
    }

    // Check if session has an error (e.g., token refresh failed)
    if (session.error === "RefreshAccessTokenError") {
        const error = new Error('Session expired');
        error.status = 401;
        error.details = ["Your session has expired. Please sign in again"];
        throw error;
    }

    // Find user in database by email from session
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
        const error = new Error('User not found');
        error.status = 404;
        error.details = ["User account does not exist in the database"];
        throw error;
    }

    return {
        user,
        session,
        tokenData: session // For backward compatibility
    };
}

/**
 * DEPRECATED: Legacy authentication using email header
 * WARNING: This is insecure and should only be used during migration
 * TODO: Remove this after all clients are updated to use NextAuth
 *
 * @param {Request} request - The incoming request object
 * @returns {Promise<{user: Object, tokenData: null}>} User object
 * @throws {Error} If authentication fails
 */
export async function authenticateUserLegacy(request) {
    await connectDB();

    const Email = request.headers.get('auth-email');

    if (!Email) {
        const error = new Error('Authentication required');
        error.status = 401;
        error.details = ["auth-email header is required"];
        throw error;
    }

    const user = await User.findOne({ email: Email });

    if (!user) {
        const error = new Error('User not found');
        error.status = 404;
        error.details = ["User with this email does not exist"];
        throw error;
    }

    // Log usage for migration tracking
    console.warn(`[DEPRECATED] Legacy auth used for: ${Email}`);

    return { user, tokenData: null };
}