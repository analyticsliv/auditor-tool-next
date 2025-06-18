import { authenticateUser } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Audit from '@/models/audit';
import { NextRequest, NextResponse } from 'next/server';
const moment = require('moment');

// POST - Create or update audit
export async function POST(request) {
    try {
        // Get user from request (you'll need to implement auth middleware)
        // await connectDB();
        const { user, tokenData } = await authenticateUser(request);
        const { propertyId, accountId, auditData, endApiData, accountName, propertyName } = await request.json();

        if (!propertyId || !accountId || !auditData || !endApiData) {
            return NextResponse.json({ error: 'Some content are missing' }, { status: 400 });
        }

        const startOfDay = moment().startOf('day').toDate();
        const endOfDay = moment().endOf('day').toDate();

        // Find an existing audit entry for today with the same propertyId and accountId
        let audit = await Audit.findOne({
            propertyId,
            accountId,
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        });

        if (audit) {
            // Update the existing audit entry
            audit.auditData = auditData;
            audit.endApiData = endApiData;
            audit.updatedAt = moment();
            await audit.save();
            return NextResponse.json({ message: 'Audit entry updated successfully', audit }, { status: 200 });
        } else {
            // Create a new audit entry
            audit = new Audit({
                propertyId,
                accountId,
                user: user._id,
                auditData,
                endApiData,
                accountName,
                propertyName
            });
            await audit.save();
            return NextResponse.json({ message: 'Audit entry created successfully', audit }, { status: 201 });
        }
    } catch (error) {
        console.error('Error storing Audit report:', error);
        return NextResponse.json({
            error: error.message,
            details: error.details || ["Authentication failed"]
        }, { status: error.status || 500 });
    }
}

// GET - Get all audits for user
export async function GET(request) {
    try {
        await connectDB();
        // Get user from request (you'll need to implement auth middleware)
        const { user, tokenData } = await authenticateUser(request);
        console.log("user in /api/audit---",user._id)

        const auditRecords = await Audit.find({ user: user._id }).exec();
        console.log("auditrecoedd in db 00----",auditRecords?.length)

        if (auditRecords?.length === 0) {
            return NextResponse.json({ message: 'No audit records found for the user' }, { status: 404 });
        }

        return NextResponse.json(auditRecords, { status: 200 });
    } catch (error) {
        console.error('Error fetching audit records:', error);
        return NextResponse.json({ 
            error: error.message, 
            details: error.details || ["Authentication failed"] 
        }, { status: error.status || 500 });
    }
}
