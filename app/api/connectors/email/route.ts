import { NextResponse } from "next/server";

// Email Inbound Connector
// Setup: 1. Configure Inbound Parse in your email provider (SendGrid, Postmark, Resend, etc.)
//        2. Set the Destination URL to: https://your-domain/api/connectors/email
//        3. Emails sent to your triage address will now automatically create tickets.

export async function POST(req: Request) {
  try {
    // Standard Inbound Email providers usually send data as multipart/form-data
    const contentType = req.headers.get("content-type") || "";
    
    let emailSubject = "";
    let emailBody = "";
    let senderEmail = "";

    if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      emailSubject = formData.get("subject")?.toString() || "No Subject";
      emailBody = formData.get("text")?.toString() || formData.get("html")?.toString() || "";
      senderEmail = formData.get("from")?.toString() || "unknown@sender.com";
    } else {
      // JSON format (some providers)
      const body = await req.json();
      emailSubject = body.subject || "No Subject";
      emailBody = body.text || body.body || "";
      senderEmail = body.from || body.sender || "unknown@sender.com";
    }

    if (!emailBody) {
      return NextResponse.json({ error: "Empty email body" }, { status: 400 });
    }

    const fullFeedback = `Subject: ${emailSubject}\n\nFrom: ${senderEmail}\n\nContent:\n${emailBody}`;

    // Triage using AI
    const origin = new URL(req.url).origin;
    const triageResponse = await fetch(`${origin}/api/triage`, {
      method: "POST",
      body: new URLSearchParams({
        feedback: fullFeedback,
        customerTier: "Enterprise", // Default for direct email signals
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!triageResponse.ok) {
      const errorText = await triageResponse.text();
      throw new Error(`AI Triage failed: ${errorText}`);
    }

    const triageResult = await triageResponse.json();

    console.log(`📧 Email: Triaged signal from ${senderEmail} → "${triageResult.title}"`);

    return NextResponse.json({
      success: true,
      ticketId: triageResult.id,
      title: triageResult.title,
      severity: triageResult.severity
    });

  } catch (error: any) {
    console.error("Email Connector Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
