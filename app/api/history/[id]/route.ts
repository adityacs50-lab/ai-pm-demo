import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const sql = getDb();
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    const tickets = await sql`
      SELECT id, type, title, severity, labels, mrr_at_risk, customer_tier, 
             raw_feedback, full_result, created_at
      FROM tickets 
      WHERE id = ${id} AND (user_email = ${userEmail} OR user_email IS NULL)
    `;

    if (tickets.length === 0) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json(tickets[0]);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch ticket", details: error.message },
      { status: 500 }
    );
  }
}
