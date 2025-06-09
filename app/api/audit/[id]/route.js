import { authenticateUser } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Audit from '@/models/audit';
import { NextResponse } from 'next/server';

export async function GET(request, context) {
    try {
        // await connectDB();

        const { params } = context;
        const { id } = params;

        const { user } = await authenticateUser(request);

        const auditRecord = await Audit.findOne({ _id: id, user: user._id }).exec();

        if (!auditRecord) {
            return NextResponse.json({ message: 'Audit record not found' }, { status: 404 });
        }

        return NextResponse.json(auditRecord, { status: 200 });
    } catch (error) {
        console.error('Error fetching audit record:', error);
        return NextResponse.json({
            error: error.message,
            details: error.details || ["Authentication failed"]
        }, { status: error.status || 500 });
    }
}