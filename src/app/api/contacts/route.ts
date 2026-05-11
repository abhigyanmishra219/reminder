import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromHeader } from '@/services/jwt';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';
import Contact from '../../../../models/Contact'

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = getTokenFromHeader(authHeader || null);

    const userData = verifyToken(token || '');

    if (!userData) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    const user = await User.findById(userData.id);

    let excelContacts: any[] = [];
    let googleContacts: any[] = [];

    // === GOOGLE SHEET MODE ===
    if (user?.sheetId) {
      try {
        const response = await fetch(`https://docs.google.com/spreadsheets/d/${user.sheetId}/gviz/tq?tqx=out:json`);
        const text = await response.text();
        const json = JSON.parse(text.substring(47).slice(0, -2));

        const rows = json.table.rows.map((row: any) => {
          let dateStr = "";
          let timeStr = "";

          // Improved Date Parsing
          if (row.c?.[3]) {
            if (row.c[3].f) dateStr = row.c[3].f;                    // Formatted date (best)
            else if (typeof row.c[3].v === 'string') dateStr = row.c[3].v;
            else if (row.c[3].v) dateStr = String(row.c[3].v);
          }

          // Improved Time Parsing
          if (row.c?.[2]) {
            if (row.c[2].f) timeStr = row.c[2].f;
            else if (typeof row.c[2].v === 'number') {
              const fraction = row.c[2].v;
              const hours = Math.floor(fraction * 24);
              const minutes = Math.round((fraction * 24 - hours) * 60);
              timeStr = `${hours}:${minutes.toString().padStart(2, '0')}`;
            } else {
              timeStr = String(row.c[2].v || "");
            }
          }

          return {
            _id: "gs-" + Math.random().toString(36).substr(2, 9),
            name: row.c?.[0]?.v || "Unknown",
            phone: String(row.c?.[1]?.v || "").replace(/[^0-9]/g, ""),
            date: dateStr,
            time: timeStr,
          };
        });

        googleContacts = rows;
      } catch (e) {
        console.error("Google Sheet Error:", e);
      }
    }

    // === EXCEL MODE ===
    const today = new Date();
    const todayStr = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;

    const dbContacts = await Contact.find({
      userId: userData.id,
      date: todayStr
    });

    excelContacts = dbContacts.map((c: any) => ({
      ...c.toObject(),
      source: "excel"
    }));

    return NextResponse.json({ 
      success: true, 
      excelContacts,
      googleContacts,
      total: excelContacts.length + googleContacts.length
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}