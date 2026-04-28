import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET: Fetch analysis history (paginated)
export async function GET(req: Request) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email || "anonymous";

    // Join transcripts and analyses
    const history = await sql`
      SELECT t.id, t.content as raw_feedback, t.created_at, 
             a.full_result
      FROM transcripts t
      LEFT JOIN analyses a ON t.id = a.transcript_id
      WHERE t.user_id = ${userEmail}
      ORDER BY t.created_at DESC 
      LIMIT ${limit} OFFSET ${offset}
    `;

    const countResult = await sql`SELECT COUNT(*) as total FROM transcripts WHERE user_id = ${userEmail}`;
    const total = parseInt(countResult[0].total);

    // Map the database output to the format expected by the frontend HistoryView
    const mappedTickets = history.map(row => {
      const parsed = typeof row.full_result === 'string' ? JSON.parse(row.full_result) : (row.full_result || {});
      return {
        id: row.id,
        title: parsed.title || "Pending Analysis...",
        severity: "Discovery", // Mocking old severity field for UI compatibility
        labels: [],
        mrr_at_risk: 0,
        customer_tier: "Free",
        created_at: row.created_at
      };
    });

    return NextResponse.json({
      tickets: mappedTickets,
      pagination: { total, limit, offset },
      stats: {
        totalTickets: total,
        totalMrrAtRisk: 0,
        severityBreakdown: [],
      }
    });
  } catch (error: any) {
    if (error.message?.includes("does not exist")) {
      return NextResponse.json({ tickets: [], pagination: { total: 0, limit: 20, offset: 0 }, stats: { totalTickets: 0 } });
    }
    console.error("[HISTORY API ERROR]:", error.stack || error.message);
    return NextResponse.json({ error: "Internal Server Error fetching history." }, { status: 500 });
  }
}

// POST: Save a discovery result
export async function POST(req: Request) {
  try {
    const sql = getDb();
    const body = await req.json();
    const { result, rawFeedback, userEmail } = body;
    
    // Default to anonymous if no user Email
    const userId = userEmail || "anonymous";

    // 1. Save Transcript
    const sessionId = crypto.randomUUID();
    const transcriptRows = await sql`
      INSERT INTO transcripts (user_id, content, status, session_id)
      VALUES (${userId}, ${rawFeedback || 'N/A'}, 'analyzed', ${sessionId})
      RETURNING id
    `;
    const transcriptId = transcriptRows[0].id;

    // 2. Save Analysis
    await sql`
      INSERT INTO analyses (
        transcript_id, 
        full_result
      )
      VALUES (
        ${transcriptId},
        ${JSON.stringify(result)}
      )
    `;

    return NextResponse.json({ success: true, transcriptId });
  } catch (error: any) {
    console.error("[HISTORY SAVE ERROR]:", error.stack || error.message);
    return NextResponse.json(
      { error: "Internal Server Error saving analysis." },
      { status: 500 }
    );
  }
}
