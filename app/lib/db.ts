import { neon } from "@neondatabase/serverless";

// Create a reusable SQL query function
export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set. Create a Neon database and add the connection string.");
  }
  return neon(databaseUrl);
}

// Types for our stored data
export interface StoredTicket {
  id: number;
  type: "individual" | "batch";
  title: string;
  severity: string;
  labels: string[];
  mrr_at_risk: number;
  customer_tier: string;
  raw_feedback: string;
  full_result: any;
  created_at: string;
}

export interface StoredCluster {
  id: number;
  batch_id: number;
  title: string;
  severity: string;
  count: number;
  total_mrr_at_risk: number;
  summary: string;
  labels: string[];
  created_at: string;
}
