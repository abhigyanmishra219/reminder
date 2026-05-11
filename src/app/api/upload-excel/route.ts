import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { verifyToken, getTokenFromHeader } from '@/services/jwt';
import connectDB from '../../../../lib/mongodb';
import Contact from '../../../../models/Contact';

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromHeader(req.headers.get('authorization'));
    const user = verifyToken(token || '');

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const workbook = XLSX.read(bytes, { type: 'array' });
    const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

    console.log("📊 Raw Excel Data:", jsonData);

    const contactsToSave = jsonData.map((row: any) => {
      let rawDate = row.Date || row.date || "";

      let formattedDate = "";

      // Excel Serial Date Fix
      if (rawDate && !isNaN(Number(rawDate))) {
        const serial = Number(rawDate);
        const excelDate = new Date((serial - 25569) * 86400 * 1000);
        const d = String(excelDate.getDate()).padStart(2, '0');
        const m = String(excelDate.getMonth() + 1).padStart(2, '0');
        const y = excelDate.getFullYear();
        formattedDate = `${d}-${m}-${y}`;
        console.log(`Converted Serial ${serial} → ${formattedDate}`);
      } else if (rawDate) {
        formattedDate = String(rawDate).trim();
      }

      let time = String(row.Time || row.time || "").trim();
      if (time && !isNaN(Number(time))) {
        const fraction = Number(time);
        const hours = Math.floor(fraction * 24);
        const minutes = Math.round((fraction * 24 - hours) * 60);
        time = `${hours}:${minutes.toString().padStart(2, '0')}`;
      }

      return {
        userId: user.id,
        name: String(row.Name || row.name || "Unknown").trim(),
        phone: String(row.Phone || row.phone || "").replace(/[^0-9]/g, '').trim(),
        date: formattedDate,
        time: time,
      };
    }).filter(c => c.phone.length >= 10 && c.date);

    if (contactsToSave.length === 0) {
      return NextResponse.json({ error: "No valid contacts found" }, { status: 400 });
    }

    await Contact.insertMany(contactsToSave);

    return NextResponse.json({
      success: true,
      message: `${contactsToSave.length} contacts uploaded successfully!`,
      count: contactsToSave.length
    });

  } catch (error: any) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}