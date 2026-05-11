import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('/api/send-whatsapp', {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contacts: [{
          name: "Test User",
          phone: "919555536312"   // Apna number daalo
        }],
        message: "This is a test message from your Reminder App. Ignore if received."
      })
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: e });
  }
}