import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { Octokit } from "octokit";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const octokit = new Octokit({ auth: process.env.GITHUB_PAT });

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const feedback = formData.get("feedback") as string;
    const file = formData.get("file") as File | null;
    const isBatchEarly = formData.get("isBatch") === "true";

    if (!feedback && !file && !isBatchEarly) {
      return NextResponse.json(
        { error: "Missing both feedback text and file" },
        { status: 400 }
      );
    }

    const customerTier = formData.get("customerTier") as string || "Free";

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

    // Prepare multimodal parts for Gemini
    const parts: any[] = [];
    
    if (feedback) {
      parts.push({ text: `Customer Feedback: "${feedback}"` });
    }

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      let mimeType = file.type || "application/pdf";
      if (file.name.endsWith(".mp4")) mimeType = "video/mp4";
      if (file.name.endsWith(".mov")) mimeType = "video/quicktime";
      
      parts.push({
        inlineData: {
          data: buffer.toString("base64"),
          mimeType: mimeType,
        },
      });
    }

    const isBatch = formData.get("isBatch") === "true";
    const batchData = formData.get("batchData") as string | null;

    // Define the individual structured output schema
    const individualSchema = {
      description: "Triage feedback into a structured bug report with business impact analysis",
      type: SchemaType.OBJECT,
      properties: {
        title: { type: SchemaType.STRING, description: "A concise bug title." },
        severity: { type: SchemaType.STRING, enum: ["Low", "Medium", "High", "Critical"] },
        acceptanceCriteria: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        labels: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        hiddenRisks: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        duplicateOf: { type: SchemaType.NUMBER, nullable: true },
        businessImpact: {
          type: SchemaType.OBJECT,
          properties: {
            mrrAtRisk: { type: SchemaType.NUMBER },
            priorityReasoning: { type: SchemaType.STRING },
          },
          required: ["mrrAtRisk", "priorityReasoning"]
        },
        securityRisk: { type: SchemaType.STRING, description: "Detailed description of security threats found, if any." },
        prd: { type: SchemaType.STRING, description: "A full, professional PRD in Markdown format." }
      },
      required: ["title", "severity", "acceptanceCriteria", "labels", "hiddenRisks", "businessImpact", "prd"],
    };

    // Define the batch clustering schema
    const batchSchema = {
      description: "Consolidated clusters of feedback from a dataset",
      type: SchemaType.OBJECT,
      properties: {
        clusters: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              title: { type: SchemaType.STRING, description: "Title for this cluster of issues." },
              count: { type: SchemaType.NUMBER, description: "Number of rows representing this issue." },
              severity: { type: SchemaType.STRING, enum: ["Low", "Medium", "High", "Critical"] },
              totalMrrAtRisk: { type: SchemaType.NUMBER, description: "Aggregated MRR risk for this cluster." },
              summary: { type: SchemaType.STRING, description: "A few sentences describing the common problem." },
              suggestedLabels: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            },
            required: ["title", "count", "severity", "totalMrrAtRisk", "summary", "suggestedLabels"]
          }
        },
        globalSummary: { type: SchemaType.STRING, description: "Overall health of the product based on this dataset." }
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
        You are an expert Data Analyst and PM. Analyze the provided CSV dataset of customer feedback.
        
        GOAL:
        1. Cluster similar feedback rows into 3-5 high-level 'Consolidated Clusters'.
        2. Count how many users reported each cluster.
        3. AGGREGATED REVENUE: If the dataset has billing/tier info, sum the MRR at risk for each cluster. 
           (Assume Enterprise: $5k, Pro: $500, Free: $0 if not specified).
        4. Return a global summary of the dataset findings.
      `;
      finalParts.push({ text: `DATASET TO ANALYZE: ${batchData}` });
    } else {
      systemInstruction = `
        Analyze this document/feedback. Identify any product bugs or feature requests mentioned and format them into our standard JSON ticket structure.
        
        AGENTIC PRD CREATION:
        You MUST generate a comprehensive PRD in the 'prd' field. 
        Use the following Markdown structure:
        # PRD: [Feature Title]
        ## 1. User Story
        - As a [user], I want to [action] so that [benefit].
        ## 2. Technical Constraints
        - [Constraint 1]
        - [Constraint 2]
        ## 3. Edge Cases
        - [Case 1]
        ## 4. Success Metrics
        - [Metric 1]
        ## 5. Implementation Plan
        - Step 1: ...
        - Step 2: ...

        BUSINESS IMPACT ANALYSIS:
        The current reporter is at the '${customerTier}' tier. 
        Estimate the Monthly Recurring Revenue (MRR) at risk if this issue is not fixed. 
        - Free: $0-$100 risk.
        - Pro: $100-$1,000 risk.
        - Enterprise: $1,000-$20,000+ risk.
        If it's a security bug or affecting multiple users, escalate the risk.

        DUPLICATE DETECTION:
        Check the list of existing issues below. If this new feedback describes the same problem as an existing issue, set 'duplicateOf' to that issue's ID.
        
        EXISTING ISSUES:
        ${existingIssuesContext}

        SECURITY PROTOCOL:
        1. If the document mentions keywords like 'Security', 'Login', 'Password', 'Data Leak', 'Auth', 'Privacy', or unauthorized access, you MUST:
           - Set severity to "Critical".
           - Include the tag "security-critical" in the labels array.
           - Provide a detailed 'securityRisk' description.
        2. For all issues, provide a primary classification label (e.g., 'bug', 'enhancement', 'task', 'documentation', 'question') in the labels array.

        HIDDEN RISKS:
        Identify any potential technical or business risks that aren't explicitly stated but are implied by the document.
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
      notifySecurityTeam(triageResult.title, feedback);
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
            rawFeedback: feedback,
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
    console.error("Triage API Error:", error);
    return NextResponse.json(
      { error: "Failed to process feedback", details: error.message },
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

