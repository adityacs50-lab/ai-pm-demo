import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET: Fetch triage history (paginated)
export async function GET(req: Request) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const type = searchParams.get("type"); // "individual" | "batch" | null (all)

    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    let tickets;
    if (type) {
      tickets = await sql`
        SELECT id, type, title, severity, labels, mrr_at_risk, customer_tier, 
               github_issue_number, github_issue_url, created_at
        FROM tickets 
        WHERE type = ${type} AND (user_email = ${userEmail} OR user_email IS NULL)
        ORDER BY created_at DESC 
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      tickets = await sql`
        SELECT id, type, title, severity, labels, mrr_at_risk, customer_tier, 
               github_issue_number, github_issue_url, created_at
        FROM tickets 
        WHERE user_email = ${userEmail} OR user_email IS NULL
        ORDER BY created_at DESC 
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    // Get counts
    const countResult = await sql`SELECT COUNT(*) as total FROM tickets`;
    const total = parseInt(countResult[0].total);

    // Get total MRR at risk
    const mrrResult = await sql`SELECT COALESCE(SUM(mrr_at_risk), 0) as total_mrr FROM tickets`;
    const totalMrr = parseFloat(mrrResult[0].total_mrr);

    // Get severity breakdown
    const severityBreakdown = await sql`
      SELECT severity, COUNT(*) as count 
      FROM tickets 
      GROUP BY severity 
      ORDER BY count DESC
    `;

    return NextResponse.json({
      tickets,
      pagination: { total, limit, offset },
      stats: {
        totalTickets: total,
        totalMrrAtRisk: totalMrr,
        severityBreakdown,
      }
    });
  } catch (error: any) {
    // If table doesn't exist, return empty
    if (error.message?.includes("does not exist")) {
      return NextResponse.json({
        tickets: [],
        pagination: { total: 0, limit: 20, offset: 0 },
        stats: { totalTickets: 0, totalMrrAtRisk: 0, severityBreakdown: [] }
      });
    }
    console.error("History API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch history", details: error.message },
      { status: 500 }
    );
  }
}

// POST: Save a triage result
export async function POST(req: Request) {
  try {
    const sql = getDb();
    const body = await req.json();
    const { type, result, customerTier, rawFeedback, filename, userEmail } = body;

    if (type === "batch" && result.clusters) {
      // Save batch analysis
      const batchRows = await sql`
        INSERT INTO batch_analyses (filename, row_count, cluster_count, total_mrr_at_risk, global_summary, full_result, user_email)
        VALUES (
          ${filename || "uploaded.csv"}, 
          ${result.clusters.reduce((sum: number, c: any) => sum + c.count, 0)},
          ${result.clusters.length},
          ${result.clusters.reduce((sum: number, c: any) => sum + c.totalMrrAtRisk, 0)},
          ${result.globalSummary},
          ${JSON.stringify(result)},
          ${userEmail || null}
        )
        RETURNING id
      `;
      const batchId = batchRows[0].id;

      // Save each cluster as a ticket
      for (const cluster of result.clusters) {
        await sql`
          INSERT INTO tickets (type, title, severity, labels, mrr_at_risk, raw_feedback, full_result, user_email)
          VALUES (
            'batch',
            ${cluster.title},
            ${cluster.severity},
            ${JSON.stringify(cluster.suggestedLabels)},
            ${cluster.totalMrrAtRisk},
            ${cluster.summary},
            ${JSON.stringify(cluster)},
            ${userEmail || null}
          )
        `;

        await sql`
          INSERT INTO clusters (batch_id, title, severity, user_count, total_mrr_at_risk, summary, labels)
          VALUES (
            ${batchId},
            ${cluster.title},
            ${cluster.severity},
            ${cluster.count},
            ${cluster.totalMrrAtRisk},
            ${cluster.summary},
            ${JSON.stringify(cluster.suggestedLabels)}
          )
        `;
      }

      return NextResponse.json({ success: true, batchId, clustersStored: result.clusters.length });

    } else {
      // Save individual ticket
      const rows = await sql`
        INSERT INTO tickets (type, title, severity, labels, mrr_at_risk, customer_tier, raw_feedback, full_result, user_email)
        VALUES (
          'individual',
          ${result.title},
          ${result.severity},
          ${JSON.stringify(result.labels)},
          ${result.businessImpact?.mrrAtRisk || 0},
          ${customerTier || 'Free'},
          ${rawFeedback || ''},
          ${JSON.stringify(result)},
          ${userEmail || null}
        )
        RETURNING id
      `;

      return NextResponse.json({ success: true, ticketId: rows[0].id });
    }
  } catch (error: any) {
    console.error("Save Error:", error);
    return NextResponse.json(
      { error: "Failed to save result", details: error.message },
      { status: 500 }
    );
  }
}
