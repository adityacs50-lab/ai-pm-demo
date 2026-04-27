import { NextResponse } from "next/server";

// Generic Webhook Connector
// Setup: 1. Send ANY JSON payload to this endpoint.
//        2. The AI will automatically identify the feedback content and triage it.
//        3. Ideal for custom integrations or internal tools.

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Stringify the entire body for the AI to analyze
    const rawSignal = JSON.stringify(body, null, 2);

    if (!rawSignal || rawSignal === "{}") {
      return NextResponse.json({ error: "Empty signal payload" }, { status: 400 });
    }

    // Triage using AI
    const origin = new URL(req.url).origin;
    const triageResponse = await fetch(`${origin}/api/triage`, {
      method: "POST",
      body: new URLSearchParams({
        feedback: `RAW WEBHOOK SIGNAL:\n${rawSignal}`,
        customerTier: "Custom",
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

    console.log(`🔗 Webhook: Triaged custom signal → "${triageResult.title}"`);

    return NextResponse.json({
      success: true,
      ticketId: triageResult.id,
      title: triageResult.title,
      severity: triageResult.severity
    });

  } catch (error: any) {
    console.error("Webhook Connector Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
