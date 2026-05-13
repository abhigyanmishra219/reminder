import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromHeader } from '@/services/jwt';
import connectDB from '../../../../lib/mongodb';
import Contact from '../../../../models/Contact';

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromHeader(req.headers.get('authorization'));
    const user = verifyToken(token || '');

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const uploads = await Contact.aggregate([
      { $match: { userId: user.id } },
      {
        $group: {
          _id: "$uploadId",
          uploadName: { $first: "$uploadName" },
          count: { $sum: 1 },
          latestUpload: { $max: "$createdAt" }
        }
      },
      { $sort: { latestUpload: -1 } }   // Show latest uploads first
    ]);

    return NextResponse.json({
      success: true,
      uploads: uploads.map((u: any) => ({
        uploadId: u._id,
        uploadName: u.uploadName || `Upload ${new Date(u.latestUpload).toLocaleString()}`,
        count: u.count
      }))
    });

  } catch (error: any) {
    console.error("Uploads API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}