import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/db";

// POST: Initialize/migrate the database tables
// GET: Check database health
export async function POST() {
  try {
    const sql = getDb();

    // Create tickets table (stores individual triage results)
    await sql`
      CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY,
        type VARCHAR(20) DEFAULT 'individual',
        title TEXT NOT NULL,
        severity VARCHAR(20),
        labels JSONB DEFAULT '[]',
        mrr_at_risk NUMERIC DEFAULT 0,
        customer_tier VARCHAR(20) DEFAULT 'Free',
        raw_feedback TEXT,
        full_result JSONB,
        github_issue_number INTEGER,
        github_issue_url TEXT,
        user_email VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create batch_analyses table (stores batch CSV/XLSX runs)
    await sql`
      CREATE TABLE IF NOT EXISTS batch_analyses (
        id SERIAL PRIMARY KEY,
        filename TEXT,
        row_count INTEGER DEFAULT 0,
        cluster_count INTEGER DEFAULT 0,
        total_mrr_at_risk NUMERIC DEFAULT 0,
        global_summary TEXT,
        full_result JSONB,
        user_email VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create clusters table (stores individual clusters from batch runs)
    await sql`
      CREATE TABLE IF NOT EXISTS clusters (
        id SERIAL PRIMARY KEY,
        batch_id INTEGER REFERENCES batch_analyses(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        severity VARCHAR(20),
        user_count INTEGER DEFAULT 0,
        total_mrr_at_risk NUMERIC DEFAULT 0,
        summary TEXT,
        labels JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create github_events table (replaces in-memory store)
    await sql`
      CREATE TABLE IF NOT EXISTS github_events (
        id SERIAL PRIMARY KEY,
        issue_number INTEGER,
        title TEXT,
        action VARCHAR(30),
        state VARCHAR(20),
        actor VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Migration for existing tables
    try {
      await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS user_email VARCHAR(255)`;
      await sql`ALTER TABLE batch_analyses ADD COLUMN IF NOT EXISTS user_email VARCHAR(255)`;
    } catch (migErr) {
      console.log("Migration (ALTER TABLE) skipped or already applied");
    }

    return NextResponse.json({ 
      success: true, 
      message: "Database tables created successfully",
      tables: ["tickets", "batch_analyses", "clusters", "github_events"]
    });
  } catch (error: any) {
    console.error("DB Setup Error:", error);
    return NextResponse.json(
      { error: "Failed to setup database", details: error.message },
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
    return NextResponse.json(
      { status: "disconnected", error: error.message },
      { status: 500 }
    );
  }
}
