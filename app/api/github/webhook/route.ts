import { NextResponse } from "next/server";

// In-memory fallback (used when DATABASE_URL is not set)
const memoryUpdates: Array<{
  issueNumber: number;
  title: string;
  action: string;
  state: string;
  timestamp: string;
  closedBy?: string;
}> = [];

async function getDbOrNull() {
  try {
    if (!process.env.DATABASE_URL) return null;
    const { neon } = await import("@neondatabase/serverless");
    return neon(process.env.DATABASE_URL);
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const event = req.headers.get("x-github-event");
    const payload = await req.json();

    if (event !== "issues") {
      return NextResponse.json({ message: "Event ignored", event }, { status: 200 });
    }

    const { action, issue, sender } = payload;

    if (["opened", "closed", "reopened", "labeled", "assigned"].includes(action)) {
      const sql = await getDbOrNull();

      if (sql) {
        await sql`
          INSERT INTO github_events (issue_number, title, action, state, actor)
          VALUES (${issue.number}, ${issue.title}, ${action}, ${issue.state}, ${sender?.login || 'unknown'})
        `;
      } else {
        memoryUpdates.push({
          issueNumber: issue.number,
          title: issue.title,
          action,
          state: issue.state,
          timestamp: new Date().toISOString(),
          closedBy: action === "closed" ? sender?.login : undefined,
        });
        if (memoryUpdates.length > 100) memoryUpdates.splice(0, memoryUpdates.length - 100);
      }

      console.log(`🔄 GitHub Sync: Issue #${issue.number} → ${action} (${issue.state})`);
    }

    return NextResponse.json({ success: true, message: `Processed: ${action} on issue #${payload.issue?.number}` });
  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Failed to process webhook", details: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const sql = await getDbOrNull();

    if (sql) {
      const rows = await sql`
        SELECT issue_number as "issueNumber", title, action, state, actor as "closedBy", created_at as timestamp
        FROM github_events 
        ORDER BY created_at DESC 
        LIMIT 20
      `;
      return NextResponse.json({ updates: rows, total: rows.length });
    }

    return NextResponse.json({
      updates: memoryUpdates.slice(-20).reverse(),
      total: memoryUpdates.length,
    });
  } catch {
    return NextResponse.json({ updates: memoryUpdates.slice(-20).reverse(), total: memoryUpdates.length });
  }
}
