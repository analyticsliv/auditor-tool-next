import connectDB from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
const Audit = require('../../../../models/audit'); // Adjust path based on your models location

// GET - Get specific audit by ID
export async function GET(request, { params }) {
    try {
        await connectDB();
        // Get user from request (you'll need to implement auth middleware)
        const user = request.user;
        const { id } = params;

        const auditRecord = await Audit.findOne({ _id: id, user: user._id }).exec();

        if (!auditRecord) {
            return NextResponse.json({ message: 'Audit record not found' }, { status: 404 });
        }

        return NextResponse.json(auditRecord, { status: 200 });
    } catch (error) {
        console.error('Error fetching audit record:', error);
        return NextResponse.json({ error: 'Error fetching audit record' }, { status: 500 });
    }
}