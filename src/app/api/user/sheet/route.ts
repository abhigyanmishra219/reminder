import { NextRequest, NextResponse } from 'next/server';

import { verifyToken, getTokenFromHeader } from '@/services/jwt';
import connectDB from '../../../../../lib/mongodb';
import User from '../../../../../models/User';

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromHeader(req.headers.get('authorization'));
    const user = verifyToken(token || '');

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { sheetUrl } = await req.json();

    const sheetId = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];

    if (!sheetId) return NextResponse.json({ error: "Invalid Google Sheet URL" }, { status: 400 });

    await connectDB();
    await User.findByIdAndUpdate(user.id, { sheetId, sheetUrl });

    return NextResponse.json({ message: "Google Sheet connected successfully!" });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}