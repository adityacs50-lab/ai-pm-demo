import { NextResponse } from "next/server";

// Universal Webhook Connector
// Any tool (Zendesk, Intercom, Freshdesk, custom apps) can POST feedback here.
//
// Endpoint: POST https://your-domain/api/connectors/webhook
//
// Payload format (flexible — all fields optional):
// {
//   "source": "zendesk",           // Where the feedback came from
//   "feedback": "The app crashes",  // The actual feedback text
//   "customer_email": "user@co.com",
//   "customer_name": "John Doe",
//   "customer_tier": "Enterprise",  // Free | Pro | Enterprise
//   "ticket_id": "ZD-12345",       // External ticket reference
//   "priority": "high",
//   "tags": ["billing", "urgent"],
//   "metadata": {}                  // Any extra data
// }
//
// Authentication: Use the X-API-Key header with your WEBHOOK_SECRET
// Set WEBHOOK_SECRET in .env.local to enable auth (optional)

export async function POST(req: Request) {
  try {
    // Optional API key authentication
    const webhookSecret = process.env.WEBHOOK_SECRET;
    if (webhookSecret) {
      const apiKey = req.headers.get("x-api-key") || req.headers.get("authorization")?.replace("Bearer ", "");
      if (apiKey !== webhookSecret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = await req.json();

    // Extract feedback from various possible field names
    const feedbackText = body.feedback 
      || body.text 
      || body.message 
      || body.description 
      || body.content
      || body.body
      || body.comment
      || "";

    if (!feedbackText.trim()) {
      return NextResponse.json({ error: "No feedback text found. Send as 'feedback', 'text', 'message', or 'description'." }, { status: 400 });
    }

    // Build context string
    const contextParts = [feedbackText];
    if (body.customer_name) contextParts.push(`Customer: ${body.customer_name}`);
    if (body.customer_email) contextParts.push(`Email: ${body.customer_email}`);
    if (body.source) contextParts.push(`Source: ${body.source}`);
    if (body.ticket_id) contextParts.push(`External Ticket: ${body.ticket_id}`);
    if (body.tags?.length) contextParts.push(`Tags: ${body.tags.join(", ")}`);

    const fullFeedback = contextParts.join("\n");
    const customerTier = body.customer_tier || body.tier || body.plan || "Pro";

    // Triage the feedback
    const triageFormData = new FormData();
    triageFormData.append("feedback", fullFeedback);
    triageFormData.append("customerTier", customerTier);

    const origin = new URL(req.url).origin;
    const triageResponse = await fetch(`${origin}/api/triage`, {
      method: "POST",
      body: triageFormData,
    });

    if (!triageResponse.ok) {
      const errText = await triageResponse.text();
      return NextResponse.json({ error: "Triage failed", details: errText }, { status: 500 });
    }

    const triageResult = await triageResponse.json();

    console.log(`🔌 Webhook [${body.source || "unknown"}]: "${triageResult.title}" (${triageResult.severity}) — MRR Risk: $${triageResult.businessImpact?.mrrAtRisk || 0}`);

    return NextResponse.json({
      success: true,
      source: body.source || "webhook",
      externalTicketId: body.ticket_id,
      triageResult,
    });
  } catch (error: any) {
    console.error("Webhook Connector Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET: Return connector documentation
export async function GET() {
  return NextResponse.json({
    name: "Universal Webhook Connector",
    description: "Send customer feedback from any source to be auto-triaged by AI",
    endpoint: "POST /api/connectors/webhook",
    authentication: "Optional — set WEBHOOK_SECRET env var, then send X-API-Key header",
    payload: {
      feedback: "(required) The feedback text",
      source: "(optional) e.g. 'zendesk', 'intercom', 'freshdesk'",
      customer_email: "(optional) Customer email",
      customer_name: "(optional) Customer name",
      customer_tier: "(optional) Free | Pro | Enterprise (default: Pro)",
      ticket_id: "(optional) External ticket reference",
      tags: "(optional) Array of tags",
      metadata: "(optional) Any extra data",
    },
    example: {
      source: "zendesk",
      feedback: "The checkout page crashes on mobile",
      customer_email: "user@company.com",
      customer_tier: "Enterprise",
      ticket_id: "ZD-12345",
    }
  });
}
