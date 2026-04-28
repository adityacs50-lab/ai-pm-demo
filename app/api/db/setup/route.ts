import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/db";

// POST: Initialize/migrate the database tables
// GET: Check database health
export async function POST() {
  try {
    const sql = getDb();

    // DROP legacy tables from the old "Bug Triage" version, plus current tables for clean reset
    await sql`DROP TABLE IF EXISTS tickets, batch_analyses, clusters, github_events, transcripts, analyses CASCADE`;

    // 1. Transcripts Table
    await sql`
      CREATE TABLE IF NOT EXISTS transcripts (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        session_id UUID,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // 2. Analyses Table
    await sql`
      CREATE TABLE IF NOT EXISTS analyses (
        id SERIAL PRIMARY KEY,
        transcript_id INTEGER REFERENCES transcripts(id) ON DELETE CASCADE,
        full_result JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    return NextResponse.json({ 
      success: true, 
      message: "V1 Database Schema applied successfully",
      tables: ["transcripts", "analyses"]
    });
  } catch (error: any) {
    console.error("[DB SETUP ERROR]:", error.stack || error.message);
    return NextResponse.json(
      { error: "Internal Server Error during database configuration." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const sql = getDb();
    const result = await sql`SELECT NOW() as server_time`;
    return NextResponse.json({ 
      status: "connected", 
      serverTime: result[0].server_time 
    });
  } catch (error: any) {
    console.error("[DB HEALTHCHECK ERROR]:", error.stack || error.message);
    return NextResponse.json(
      { status: "disconnected", error: "Database connection failed." },
      { status: 500 }
    );
  }
}
