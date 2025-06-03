// lib/auth.js
import jwt from 'jsonwebtoken';
import connectDB from './mongodb';
import User from '../models/user';

export async function authenticateUser(request) {
    await connectDB();

    const token = request.headers.get('auth-token');
    const Email = request.headers.get('auth-email');

    if (!token && !Email) {
        const error = new Error('Authentication required');
        error.status = 401;
        error.details = ["Either auth-token or auth-email header is required"];
        throw error;
    }

    let user = null;
    let tokenData = null;

    if (Email) {
        user = await User.findOne({ email: Email });
        if (!user) {
            const error = new Error('User not found');
            error.status = 404;
            error.details = ["User with this email does not exist"];
            throw error;
        }
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            user = await User.findOne({ email: decoded.email });
            
            if (!user) {
                const error = new Error('User not found');
                error.status = 404;
                error.details = ["User associated with token does not exist"];
                throw error;
            }
            
            tokenData = decoded;
        } catch (jwtError) {
            const error = new Error('Token verification failed');
            error.status = 401;
            
            if (jwtError.name === 'TokenExpiredError') {
                error.details = ["JWT token has expired. Please login again"];
            } else {
                error.details = ["JWT token is invalid or malformed"];
            }
            throw error;
        }
    }

    return { user, tokenData };
}