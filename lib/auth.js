import jwt from 'jsonwebtoken';
import connectDB from './mongodb';
import User from '../models/user';
import { NextResponse } from 'next/server';

export async function authenticateUser(request) {
    try {
        await connectDB();

        const token = request.headers.get('auth-token');
        const Email = request.headers.get('auth-email');

        let user = null;
        let tokenData = null;

        if (Email) {
            // Handle email-based authentication
            user = await User.findOne({ email: Email });

            if (!user) {
                throw new Error('User not found in database');
            }
        }

        // Verify the JWT token
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Check if the email exists in the database
            user = await User.findOne({ email: decoded.email });

            if (!user) {
                throw new Error('User not found in database');
            }

            tokenData = decoded;
        }

        return { user, tokenData };

    } catch (error) {
        console.error('Authentication failed:', error);
        throw error;
    }
}