import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromHeader } from '@/services/jwt';
import connectDB from '../../../../../lib/mongodb';
import Contact from '../../../../../models/Contact';

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ uploadId: string }> }
) {
  try {
    const { uploadId } = await context.params;

    const token = getTokenFromHeader(
      req.headers.get('authorization')
    );

    const user = verifyToken(token || '');

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    console.log(
      `🗑️ Deleting uploadId: ${uploadId} for user: ${user.id}`
    );

    const result = await Contact.deleteMany({
      userId: user.id,
      uploadId,
    });

    return NextResponse.json({
      success: true,
      deleted: result.deletedCount,
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}