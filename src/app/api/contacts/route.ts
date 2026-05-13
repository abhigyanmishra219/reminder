import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromHeader } from '@/services/jwt';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';
import Contact from '../../../../models/Contact';

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

    const { searchParams } = new URL(req.url);
    const uploadId = searchParams.get('uploadId');

    // Today's date (always applied)
    const today = new Date();
    const todayStr = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;

    // === GOOGLE SHEET MODE ===
    if (user?.sheetId) {
      try {
        const response = await fetch(`https://docs.google.com/spreadsheets/d/${user.sheetId}/gviz/tq?tqx=out:json`);
        const text = await response.text();
        const json = JSON.parse(text.substring(47).slice(0, -2));

        const rows = json.table.rows.map((row: any) => {
          let name = "Unknown";
          let phone = "";
          let dateStr = "";
          let timeStr = "";

          row.c?.forEach((cell: any) => {
            if (!cell) return;
            const value = String(cell.v || cell.f || "").trim();
            const lower = value.toLowerCase();

            if (lower.includes("name") || lower.includes("person")) name = value;
            else if (lower.includes("phone") || lower.includes("mobile") || lower.includes("contact") || lower.includes("number")) {
              phone = value.replace(/[^0-9]/g, "");
            }
            else if (lower.includes("date") || lower.includes("meeting") || lower.includes("schedule")) {
              dateStr = cell.f || value;
            }
            else if (lower.includes("time") || lower.includes("hour")) {
              timeStr = cell.f || value;
            }
          });

          return {
            _id: "gs-" + Math.random().toString(36).substr(2, 9),
            name,
            phone,
            date: dateStr,
            time: timeStr,
          };
        });

        // Filter today's meetings for Google Sheet
        googleContacts = rows.filter(row => row.date === todayStr);
      } catch (e) {
        console.error("Google Sheet Error:", e);
      }
    }

    // === EXCEL MODE (MongoDB) ===
    const query: any = { 
      userId: userData.id,
      date: todayStr   // ← Always filter by today's date
    };

    if (uploadId) {
      query.uploadId = uploadId;   // Filter by selected upload
    }

    const dbContacts = await Contact.find(query).sort({ createdAt: -1 });

    excelContacts = dbContacts.map((c: any) => ({
      ...c.toObject(),
      source: "excel"
    }));

    return NextResponse.json({ 
      success: true, 
      excelContacts,
      googleContacts,
      total: excelContacts.length + googleContacts.length,
      selectedUploadId: uploadId
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}