import connectDB from '@/lib/mongodb';
import Audit from '@/models/audit';
import { NextResponse } from 'next/server';

export async function GET(request, context) {
    try {
        await connectDB();

        const { params } = context;
        const { id } = params;

        const accessToken = request.headers.get("Authorization")?.replace("Bearer ", "");

        if (!accessToken) {
            return NextResponse.json({ message: 'Authorization header with Bearer token is required' }, { status: 401 });
        }

        const auditRecord = await Audit.findOne({ _id: id }).exec();

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