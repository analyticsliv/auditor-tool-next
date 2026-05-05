import connectDB from '@/lib/mongodb';
import User from '@/models/user';
import { NextResponse } from 'next/server';
import { SUPER_ADMIN_EMAIL, PLANS, ROLES, QUOTA_WINDOW_DAYS, addDays } from '@/app/config/plans';
import { logActivity } from '@/app/utils/activityLogger';

export async function POST(request) {
    try {
        await connectDB();
        const { email, name, accounts } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: 'Please provide a valid email address' }, { status: 400 });
        }

        const normalized = email.toLowerCase().trim();
        const isSuperAdmin = normalized === SUPER_ADMIN_EMAIL;
        const now = new Date();

        const update = {
            email: normalized,
            lastLogin: now,
            $setOnInsert: {
                role: isSuperAdmin ? ROLES.SUPER_ADMIN : ROLES.FREE_USER,
                auditCount: 0,
                auditLimit: PLANS.free.auditLimit,
                chatbotCount: 0,
                chatbotLimit: PLANS.free.chatbotLimit,
                quotaStartDate: now,
                quotaResetDate: addDays(now, QUOTA_WINDOW_DAYS),
                status: 'active',
            },
        };

        if (name) update.name = name.trim();
        if (accounts) {
            if (!Array.isArray(accounts)) {
                return NextResponse.json({ error: 'Accounts must be an array' }, { status: 400 });
            }
            update.accounts = accounts;
        }

        const existing = await User.findOne({ email: normalized }).lean();
        const isNew = !existing;

        const user = await User.findOneAndUpdate(
            { email: normalized },
            update,
            { new: true, upsert: true, runValidators: true }
        ).populate('accounts');

        // Ensure super admin role stays elevated even if doc pre-existed
        if (isSuperAdmin && user.role !== ROLES.SUPER_ADMIN) {
            user.role = ROLES.SUPER_ADMIN;
            await user.save();
        }

        await logActivity({
            userEmail: normalized,
            agencyId: user.agencyId || null,
            action: isNew ? 'signup' : 'login',
            metadata: { name: user.name },
        });

        return NextResponse.json({
            message: 'User added or updated in db successfully',
            user,
        }, { status: 200 });

    } catch (error) {
        console.error('Error adding or updating user:', error);
        if (error.name === 'ValidationError') {
            return NextResponse.json({ error: 'Validation failed', details: error.message }, { status: 400 });
        }
        if (error.name === 'CastError') {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to add or update user' }, { status: 500 });
    }
}
