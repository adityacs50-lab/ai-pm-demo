import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { Octokit } from "octokit";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Fuse from "fuse.js";
import fs from "fs";
import path from "path";
import historicalBugs from "@/rag_database/fintech_bugs.json";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

// Vercel Serverless Config to prevent 10s timeout crashes on heavy RAG/Gemini calls
export const maxDuration = 60;

const limiter = rateLimit({
  interval: 60 * 60 * 1000, // 1 Hour
  uniqueTokenPerInterval: 500, // Max 500 unique IPs/Users per hour
});

// Zod Schema for strict input sanitization
const TriageInputSchema = z.object({
  transcripts: z.string().optional(),
  customerTier: z.string().optional(),
  isBatch: z.boolean().optional(),
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const octokit = new Octokit({ auth: process.env.GITHUB_PAT });

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const isAuth = !!session;

    const formData = await req.formData();
    
    // 1. ZOD INPUT SANITIZATION & VALIDATION
    const rawTranscriptsStr = formData.get("transcripts") as string;
    const isBatchEarly = formData.get("isBatch") === "true";
    const rawTier = formData.get("customerTier") as string || "Free";

    const validationResult = TriageInputSchema.safeParse({
      transcripts: formData.get("transcripts") as string,
      customerTier: rawTier,
      isBatch: isBatchEarly
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Bad Request", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    let transcripts: string[] = [];
    try {
      if (validationResult.data.transcripts) {
        transcripts = JSON.parse(validationResult.data.transcripts);
      }
    } catch (e) {
      console.error("Failed to parse transcripts JSON", e);
    }
    const combinedInput = transcripts.map((t, i) => `--- TRANSCRIPT ${i + 1} ---\n${t}`).join('\n\n');
    const customerTier = validationResult.data.customerTier || "Free";


    // 2. RATE LIMITING (3/hr Unauth, 20/hr Auth)
    try {
      const userIdentifier = isAuth ? session.user?.email : "anonymous_ip_" + (req.headers.get("x-forwarded-for") || "unknown");
      const limit = isAuth ? 20 : 3;
      await limiter.check(limit, userIdentifier as string);
    } catch {
      return NextResponse.json({ error: "Rate limit exceeded. Maximum quota reached." }, { status: 429 });
    }

    if (transcripts.length === 0 && !isBatchEarly) {
      return NextResponse.json(
        { error: "Missing transcripts" },
        { status: 400 }
      );
    }

    // Fetch existing issues for duplicate detection
    let existingIssuesContext = "No existing issues found.";
    try {
      if (process.env.GITHUB_PAT && process.env.GITHUB_OWNER && process.env.GITHUB_REPO) {
        const { data: issues } = await octokit.rest.issues.listForRepo({
          owner: process.env.GITHUB_OWNER,
          repo: process.env.GITHUB_REPO,
          state: "open",
          per_page: 20,
        });
        existingIssuesContext = issues.map(i => `ID: ${i.number} | Title: ${i.title}`).join("\n");
      }
    } catch (e) {
      console.error("Failed to fetch issues for context:", e);
    }

    // --- RAG PIPELINE: LOCAL FINTECH VECTOR DB ---
    let ragContext = "No highly similar historical bugs found.";
    try {
      if (combinedInput && !isBatchEarly) {
        if (historicalBugs) {
          const fuse = new Fuse(historicalBugs, {
            keys: ["issue"],
            includeScore: true,
            threshold: 0.6 // Semantic similarity threshold
          });
          
          const results = fuse.search(combinedInput);
          if (results.length > 0) {
            const topMatch = results[0].item;
            ragContext = `
              SIMILAR HISTORICAL BUG FOUND (ID: ${topMatch.id})
              Original Issue: ${topMatch.issue}
              Historical Resolution: ${topMatch.resolution}
              Previous Severity: ${topMatch.severity}
              MRR Saved: $${topMatch.mrr_saved}
              
              INSTRUCTION: Use this historical resolution to guide your PRD. If this is exactly the same issue, mark it as a regression.
            `;
            console.log(`[RAG HIT] Found similar issue: ${topMatch.id}`);
          }
        }
      }
    } catch (e) {
      console.error("RAG Pipeline Error:", e);
    }
    // ---------------------------------------------

    // Prepare multimodal parts for Gemini
    const parts: any[] = [];
    
    if (combinedInput) {
      parts.push({ text: `Analyze the following customer transcripts:\n\n${combinedInput}` });
    }



    const isBatch = formData.get("isBatch") === "true";
    const batchData = formData.get("batchData") as string | null;

    const individualSchema = {
      description: "Synthesize user feedback into a new product feature with agentic handoff tasks",
      type: SchemaType.OBJECT,
      properties: {
        discoverySummary: { type: SchemaType.STRING, description: "The full DISCOVERY SUMMARY block including transcript counts and top problems." },
        title: { type: SchemaType.STRING, description: "The RECOMMENDED FEATURE title (3-7 words)." },
        customerJustification: { type: SchemaType.STRING, description: "The full CUSTOMER JUSTIFICATION block including root pain, evidence, frequency, cost of inaction, and signal strength." },
        technicalArchitecture: { type: SchemaType.STRING, description: "The full TECHNICAL ARCHITECTURE block including UI, Data Model, and API." },
        agentTasks: { 
          type: SchemaType.ARRAY, 
          description: "Specific development tasks for AGENT EXECUTION PLAN.",
          items: { type: SchemaType.STRING } 
        }
      },
      required: ["discoverySummary", "title", "customerJustification", "technicalArchitecture", "agentTasks"],
    };

    // Define the batch clustering schema for "Cursor for PMs"
    const batchSchema = {
      description: "Consolidate massive user feedback datasets into prioritized feature builds",
      type: SchemaType.OBJECT,
      properties: {
        clusters: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              title: { type: SchemaType.STRING, description: "Title of the proposed feature." },
              count: { type: SchemaType.NUMBER, description: "Number of user interviews/rows asking for this." },
              customerJustification: { type: SchemaType.STRING, description: "Why we must build this." },
              agentTasks: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "High level coding tasks for Cursor." }
            },
            required: ["title", "count", "customerJustification", "agentTasks"]
          }
        },
        globalSummary: { type: SchemaType.STRING, description: "Overall product strategy derived from this dataset." }
      },
      required: ["clusters", "globalSummary"]
    };

    // Initialize the model with dynamic schema
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: (isBatch ? batchSchema : individualSchema) as any,
      },
    });

    let systemInstruction = "";
    const finalParts = [...parts];

    if (isBatch && batchData) {
      systemInstruction = `
        You are an elite 'Cursor for Product Managers' AI Agent. 
        Your job is to read raw customer interviews and usage data and answer: "What should we build next?"
        
        GOAL:
        1. Cluster similar feedback rows into 3-5 high-priority 'Features to Build'.
        2. Count how many users requested each feature.
        3. Explain exactly why this is worth building based on the feedback.
        4. Provide high-level development tasks that can be immediately pasted into AI coding agents like Cursor or Claude.
      `;
      finalParts.push({ text: `DATASET TO ANALYZE: ${batchData}` });
    } else {
      systemInstruction = `
        You are a Principal Product Engineer analyzing MULTIPLE customer 
        interviews simultaneously to find patterns across all of them.

        This is a Next.js app. All file paths use /app directory.
        Example: /app/components/ComponentName.tsx, /app/api/route/route.ts

        You have been given ${transcripts.length} customer transcripts.

        --- HARD RULES ---
        1. Only surface problems mentioned across MULTIPLE transcripts
        2. Rank problems by frequency — how many customers mentioned it
        3. Extract verbatim quotes from DIFFERENT customers for same problem
        4. Never invent patterns. Every insight needs 2+ customer sources.
        5. Pick the SINGLE highest frequency problem to build the spec for
        6. Zero MBA words: no "streamline", "empower", "leverage", "robust"
        7. Every file path must use /app directory
        8. Clean theme names ONLY. No brackets, no quotes, no stray characters, no trailing punctuation.

        --- CROSS-TRANSCRIPT ANALYSIS (do this internally first) ---
        For each transcript:
        - List every pain point with speaker name
        - Tag each with a clean theme label (e.g. Data Sync Issues)

        Then across all transcripts:
        - Count how many customers mentioned each theme
        - Rank by frequency

        --- OUTPUT STRUCTURE ---
        Follow this EXACTLY. Every section is required.

        DISCOVERY SUMMARY:
        Total transcripts analyzed: ${transcripts.length}
        Total unique pain points found: [X]
        Top problems ranked:
        1. Theme Name Here — [X]/${transcripts.length} customers
        2. Theme Name Here — [X]/${transcripts.length} customers
        3. Theme Name Here — [X]/${transcripts.length} customers

        RECOMMENDED FEATURE: [3-7 words. noun phrase. no verbs.]

        CUSTOMER JUSTIFICATION:
        Root pain: [one sentence, what breaks in their workflow today]
        Evidence across customers:
        * "[verbatim quote]" — [Customer 1 name]
        * "[verbatim quote]" — [Customer 2 name]
        * "[verbatim quote]" — [Customer 3 name]
        Frequency: [X] out of ${transcripts.length} customers raised this
        Cost of inaction: [exact quote showing cost] — [speaker]
        Signal strength: STRONG/MEDIUM/WEAK — [one sentence why]

        TECHNICAL ARCHITECTURE:
        UI:
        - [ExactComponentName] at /app/components/[ExactName].tsx — [what it does]
        - [ExactComponentName] at /app/components/[ExactName].tsx — [what it does]
        Data Model:
        - [table_name]: [column] ([type]), [column] ([type])
        API:
        - POST /app/api/[route]/route.ts — accepts [shape] returns [shape]

        AGENT EXECUTION PLAN:
        [ ] Task 1: "In /app/components/[ExactName].tsx, create a [ComponentName] 
            component that accepts [exact props]. It should [exact behavior]. 
            Use [specific existing component] for styling."

        [ ] Task 2: "In /app/api/[route]/route.ts, add a [functionName] 
            function that accepts [exact params] and returns [exact return type]."

        [ ] Task 3: "Create /app/api/[newroute]/route.ts. Accept POST with 
            body [exact shape]. Call [service]. Return [exact response shape]."

        [ ] Task 4: "Update /app/db/schema to add [table/column]. 
            Write migration. Test with [specific test case]."

        --- QUALITY CHECK ---
        Before returning, verify:
        - Is DISCOVERY SUMMARY the very first thing in output? ✓
        - Do I have verbatim quotes from 2+ different customers? ✓
        - Does frequency say "[X] out of ${transcripts.length} customers"? ✓
        - Do ALL file paths start with /app? ✓
        - Zero MBA words anywhere? ✓
        - Is signal strength STRONG/MEDIUM/WEAK with reasoning? ✓

        If any check fails — rewrite that section before returning.

        ---

        EXISTING ISSUES CONTEXT (Do not duplicate work):
        ${existingIssuesContext}

        RAG KNOWLEDGE BASE (Historical Context):
        ${ragContext}
      `;
    }

    const result = await model.generateContent([
      { text: systemInstruction },
      ...finalParts
    ]);
    const response = result.response;
    const text = response.text();
    
    // Parse the AI's JSON string to return as a proper object
    const triageResult = JSON.parse(text);

    // notifySecurityTeam logic (only for individual tickets, not batch)
    if (!isBatch && triageResult.severity === "Critical" && triageResult.labels?.includes("security-critical")) {
      notifySecurityTeam(triageResult.title, combinedInput);
    }

    // Auto-save to database (silent fail if DB not configured)
    try {
      if (process.env.DATABASE_URL) {
        const session = await getServerSession(authOptions);
        const userEmail = session?.user?.email;

        const saveResponse = await fetch(new URL("/api/history", req.url).origin + "/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: isBatch ? "batch" : "individual",
            result: triageResult,
            customerTier,
            rawFeedback: combinedInput,
            userEmail: userEmail,
          }),
        });
        if (!saveResponse.ok) console.error("Failed to save to DB:", await saveResponse.text());
      }
    } catch (dbErr) {
      console.error("DB save error (non-blocking):", dbErr);
    }

    return NextResponse.json(triageResult);
  } catch (error: any) {
    // 5. ERROR MASKING: Log strictly to server, return generic message to client.
    console.error("[CRITICAL BACKEND ERROR]:", error.stack || error.message || error);
    return NextResponse.json(
      { error: "Internal Server Error. Please contact the administrator or try again later." },
      { status: 500 }
    );
  }
}

async function notifySecurityTeam(title: string, userQuote: string) {
  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;

  const payload = {
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: "🚨 SECURITY ALERT", emoji: true }
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Issue:*\n${title}` },
          { type: "mrkdwn", text: `*Severity:*\nCritical` }
        ]
      },
      {
        type: "section",
        text: { type: "mrkdwn", text: `*Customer Quote:*\n> ${userQuote}` }
      },
      {
        type: "context",
        elements: [
          { type: "mrkdwn", text: "Sent by *AI PM Triage Tool* • Auto-escalated via Security Protocol" }
        ]
      }
    ]
  };

  if (slackWebhookUrl) {
    try {
      await fetch(slackWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      console.log("✅ Slack security alert sent successfully.");
    } catch (err) {
      console.error("❌ Failed to send Slack alert:", err);
    }
  } else {
    // Fallback: console log if no webhook configured
    console.log("\n" + "=".repeat(80));
    console.log("🚨 SECURITY ALERT: High-risk issue detected.");
    console.log(`ISSUE TITLE: ${title}`);
    console.log(`USER QUOTE: "${userQuote}"`);
    console.log("⚠️  Set SLACK_WEBHOOK_URL in .env.local to enable real Slack alerts.");
    console.log("=".repeat(80) + "\n");
  }
}

