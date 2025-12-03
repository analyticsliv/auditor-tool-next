import connectDB from '@/lib/mongodb';
import User from '@/models/user';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        await connectDB();
        const { email, name, accounts } = await request.json();

        // Enhanced validation
        if (!email) {
            return NextResponse.json({
                error: 'Email is required'
            }, { status: 400 });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({
                error: 'Please provide a valid email address'
            }, { status: 400 });
        }

        // Prepare update object
        const update = {
            email: email.toLowerCase().trim(),
            lastLogin: new Date(),
            $setOnInsert: {
                auditCount: 0,
                auditLimit: 5
            }
        };

        // Only add name if provided
        if (name) {
            update.name = name.trim();
        }

        // Only add accounts if provided and is an array
        if (accounts) {
            if (Array.isArray(accounts)) {
                update.accounts = accounts;
            } else {
                return NextResponse.json({
                    error: 'Accounts must be an array'
                }, { status: 400 });
            }
        }

        const options = {
            new: true,      // Return the updated document
            upsert: true,   // Create a new document if no match is found
            runValidators: true // Run schema validators
        };

        // Find or create user
        const user = await User.findOneAndUpdate(
            { email: email.toLowerCase().trim() },
            update,
            options
        ).populate('accounts');

        return NextResponse.json({
            message: 'User added or updated in db successfully',
            user
        }, { status: 200 });

    } catch (error) {
        console.error('Error adding or updating user:', error);

        // Handle specific MongoDB errors
        if (error.name === 'ValidationError') {
            return NextResponse.json({
                error: 'Validation failed',
                details: error.message
            }, { status: 400 });
        }

        if (error.name === 'CastError') {
            return NextResponse.json({
                error: 'Invalid data format'
            }, { status: 400 });
        }

        return NextResponse.json({
            error: 'Failed to add or update user'
        }, { status: 500 });
    }
}