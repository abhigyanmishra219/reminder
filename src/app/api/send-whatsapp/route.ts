import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromHeader } from '@/services/jwt';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = getTokenFromHeader(authHeader || null);
    const user = verifyToken(token || '');

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { contacts } = await req.json();

    if (!contacts?.length) {
      return NextResponse.json({ error: "No contacts provided" }, { status: 400 });
    }

    const results = [];
    let successCount = 0;

    for (const contact of contacts) {
      try {
        const response = await fetch('https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'authkey': process.env.MSG91_AUTH_KEY!,
          },
          body: JSON.stringify({
            integrated_number: "919335913286",
            content_type: "template",
            payload: {
              messaging_product: "whatsapp",
              type: "template",
              template: {
                name: "meeting_reminder",
                language: {
                  code: "En",
                  policy: "deterministic"
                },
                namespace: "610ca09d_29b3_4193_8bab_18e0fab26f",
                to_and_components: [
                  {
                    to: [contact.phone],
                    components: {
                      body_1: {
                        parameters: [
                          { type: "text", text: contact.name || "User" },
                          { type: "text", text: contact.time || "soon" }
                        ]
                      }
                    }
                  }
                ]
              }
            }
          })
        });

        const data = await response.json();
        console.log("🔍 MSG91 Full Response:", JSON.stringify(data, null, 2));

        if (response.ok && data.status === "success") {
          successCount++;
          results.push({ name: contact.name, phone: contact.phone, status: "✅ Sent" });
        } else {
          results.push({ 
            name: contact.name, 
            phone: contact.phone, 
            status: "❌ Failed", 
            error: data.errors || data.message || JSON.stringify(data)
          });
        }
      } catch (err: any) {
        results.push({ name: contact.name, phone: contact.phone, status: "❌ Failed", error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      total: contacts.length,
      sent: successCount,
      results
    });

  } catch (error: any) {
    console.error("Send Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}