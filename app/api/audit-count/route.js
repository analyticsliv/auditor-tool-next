import connectDB from '@/lib/mongodb';
import User from '@/models/user';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const action = searchParams.get('action');
        const { email } = await req.json();

        // Validation
        if (!email) {
            return NextResponse.json(
                { success: false, message: 'Email is required' },
                { status: 400 }
            );
        }

        if (!action || !['check', 'increment'].includes(action)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid action. Must be "check" or "increment"'
                },
                { status: 400 }
            );
        }

        // Handle action
        if (action === 'check') {
            // Find user for checking (use lean for better performance)
            const user = await User.findOne({ email }).lean();

            if (!user) {
                return NextResponse.json(
                    { success: false, message: 'User not found' },
                    { status: 404 }
                );
            }

            // Ensure audit fields exist with defaults
            const auditCount = user.auditCount ?? 0;
            const auditLimit = user.auditLimit ?? 5;
            const hasReachedLimit = auditCount >= auditLimit;

            return NextResponse.json({
                success: true,
                action: 'check',
                auditCount: auditCount,
                auditLimit: auditLimit,
                hasReachedLimit,
                remainingAudits: Math.max(0, auditLimit - auditCount),
            });
        }

        if (action === 'increment') {
            // First check current count
            const currentUser = await User.findOne({ email }).lean();

            if (!currentUser) {
                return NextResponse.json(
                    { success: false, message: 'User not found' },
                    { status: 404 }
                );
            }

            const currentCount = currentUser.auditCount ?? 0;
            const currentLimit = currentUser.auditLimit ?? 5;

            // Check if already at limit
            if (currentCount >= currentLimit) {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'Audit limit already reached',
                        auditCount: currentCount,
                        auditLimit: currentLimit,
                        hasReachedLimit: true
                    },
                    { status: 403 }
                );
            }

            // Initialize fields if they don't exist, then increment
            const updatedUser = await User.findOneAndUpdate(
                { email },
                [
                    {
                        $set: {
                            // If auditCount doesn't exist or is null, set to 0, then add 1
                            auditCount: {
                                $cond: {
                                    if: {
                                        $or: [
                                            { $eq: [{ $type: "$auditCount" }, "missing"] },
                                            { $eq: ["$auditCount", null] }
                                        ]
                                    },
                                    then: 1,
                                    else: { $add: ["$auditCount", 1] }
                                }
                            },
                            // Ensure auditLimit exists
                            auditLimit: {
                                $cond: {
                                    if: {
                                        $or: [
                                            { $eq: [{ $type: "$auditLimit" }, "missing"] },
                                            { $eq: ["$auditLimit", null] }
                                        ]
                                    },
                                    then: 5,
                                    else: "$auditLimit"
                                }
                            }
                        }
                    }
                ],
                { new: true }
            );

            if (!updatedUser) {
                return NextResponse.json(
                    { success: false, message: 'Failed to update user' },
                    { status: 500 }
                );
            }

            const newAuditCount = updatedUser.auditCount ?? 1;
            const newAuditLimit = updatedUser.auditLimit ?? 5;
            const hasReachedLimit = newAuditCount >= newAuditLimit;

            // Verify by reading again from database
            const verifyUser = await User.findOne({ email }).lean();

            return NextResponse.json({
                success: true,
                action: 'increment',
                auditCount: newAuditCount,
                auditLimit: newAuditLimit,
                hasReachedLimit,
                remainingAudits: Math.max(0, newAuditLimit - newAuditCount),
                message: 'Audit count incremented successfully',
            });
        }

    } catch (error) {
        console.error('Error in audit count management:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(req) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json(
                { success: false, message: 'Email is required' },
                { status: 400 }
            );
        }

        const user = await User.findOne({ email }).lean();

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        // Ensure audit fields exist with defaults
        const auditCount = user.auditCount ?? 0;
        const auditLimit = user.auditLimit ?? 5;
        const hasReachedLimit = auditCount >= auditLimit;

        return NextResponse.json({
            success: true,
            auditCount: auditCount,
            auditLimit: auditLimit,
            hasReachedLimit,
            remainingAudits: Math.max(0, auditLimit - auditCount),
        });

    } catch (error) {
        console.error('Error checking audit count:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}