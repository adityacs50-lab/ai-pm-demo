import { NextResponse } from "next/server";

// Email Forwarding Connector
// Setup: Configure your email service to forward emails to:
//        POST https://your-domain/api/connectors/email
//
// Works with: SendGrid Inbound Parse, Mailgun Routes, Postmark Inbound,
//             or any service that can forward emails as JSON webhooks.
//
// Manual use: Forward an email by POSTing JSON:
//   { "from": "user@example.com", "subject": "Bug report", "body": "The app crashes..." }

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let emailData: { from?: string; subject?: string; body?: string; text?: string; html?: string };

    if (contentType.includes("application/json")) {
      emailData = await req.json();
    } else if (contentType.includes("multipart/form-data")) {
      // Handle SendGrid/Mailgun style form data
      const formData = await req.formData();
      emailData = {
        from: formData.get("from") as string || formData.get("sender") as string || "",
        subject: formData.get("subject") as string || "",
        body: formData.get("text") as string || formData.get("body") as string || "",
        html: formData.get("html") as string || "",
      };
    } else {
      return NextResponse.json({ error: "Unsupported content type" }, { status: 400 });
    }

    const feedbackText = [
      emailData.subject ? `Subject: ${emailData.subject}` : "",
      emailData.body || emailData.text || "",
      emailData.from ? `\nFrom: ${emailData.from}` : "",
    ].filter(Boolean).join("\n");

    if (!feedbackText.trim()) {
      return NextResponse.json({ error: "Empty email body" }, { status: 400 });
    }

    // Triage the email content
    const triageFormData = new FormData();
    triageFormData.append("feedback", feedbackText);
    triageFormData.append("customerTier", "Enterprise"); // Emails usually from paying customers

    const origin = new URL(req.url).origin;
    const triageResponse = await fetch(`${origin}/api/triage`, {
      method: "POST",
      body: triageFormData,
    });

    if (!triageResponse.ok) {
      const errText = await triageResponse.text();
      console.error("Email triage failed:", errText);
      return NextResponse.json({ error: "Triage failed", details: errText }, { status: 500 });
    }

    const triageResult = await triageResponse.json();

    console.log(`📧 Email Connector: Triaged email from ${emailData.from || "unknown"} → "${triageResult.title}" (${triageResult.severity})`);

    return NextResponse.json({
      success: true,
      source: "email",
      from: emailData.from,
      subject: emailData.subject,
      triageResult,
    });
  } catch (error: any) {
    console.error("Email Connector Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
