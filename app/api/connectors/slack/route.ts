import { NextResponse } from "next/server";
import { WebClient } from "@slack/web-api";

// Slack Bot Connector
// Setup: 1. Create Slack App at https://api.slack.com/apps
//        2. Enable Event Subscriptions → Request URL: https://your-domain/api/connectors/slack
//        3. Subscribe to bot events: message.channels, message.groups
//        4. Install app to workspace → Copy Bot Token
//        5. Add SLACK_BOT_TOKEN to .env.local
//        6. Invite bot to channels: /invite @YourBot

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Slack URL verification challenge (required for initial setup)
    if (body.type === "url_verification") {
      return NextResponse.json({ challenge: body.challenge });
    }

    // Ignore retry events
    const retryNum = req.headers.get("x-slack-retry-num");
    if (retryNum) {
      return NextResponse.json({ ok: true });
    }

    // Process message events
    if (body.type === "event_callback" && body.event?.type === "message") {
      const event = body.event;

      // Ignore bot messages and message edits
      if (event.bot_id || event.subtype) {
        return NextResponse.json({ ok: true });
      }

      const messageText = event.text;
      const channel = event.channel;
      const userId = event.user;

      // Only triage messages that look like feedback/complaints
      // Check for keywords that suggest product feedback
      const feedbackKeywords = [
        "bug", "broken", "crash", "error", "slow", "issue", "problem",
        "can't", "cannot", "doesn't work", "not working", "frustrated",
        "feature request", "wish", "please add", "need", "should",
        "terrible", "awful", "horrible", "worst", "hate", "annoying",
        "payment", "billing", "login", "security", "data loss"
      ];

      const isFeedback = feedbackKeywords.some(kw => 
        messageText.toLowerCase().includes(kw)
      );

      if (!isFeedback) {
        return NextResponse.json({ ok: true, skipped: "Not feedback" });
      }

      // Triage the message using our AI engine
      const triageFormData = new FormData();
      triageFormData.append("feedback", messageText);
      triageFormData.append("customerTier", "Pro"); // Default tier for Slack users

      const origin = new URL(req.url).origin;
      const triageResponse = await fetch(`${origin}/api/triage`, {
        method: "POST",
        body: triageFormData,
      });

      if (!triageResponse.ok) {
        console.error("Slack triage failed:", await triageResponse.text());
        return NextResponse.json({ ok: true, error: "Triage failed" });
      }

      const triageResult = await triageResponse.json();

      // Post the triage result back to the Slack channel
      const slackToken = process.env.SLACK_BOT_TOKEN;
      if (slackToken) {
        const slack = new WebClient(slackToken);

        const severityEmoji: Record<string, string> = {
          Critical: "🔴",
          High: "🟠",
          Medium: "🟡",
          Low: "🟢",
        };

        await slack.chat.postMessage({
          channel,
          thread_ts: event.ts, // Reply in thread
          blocks: [
            {
              type: "header",
              text: { type: "plain_text", text: `🎫 ${triageResult.title}`, emoji: true }
            },
            {
              type: "section",
              fields: [
                { type: "mrkdwn", text: `*Severity:* ${severityEmoji[triageResult.severity] || "⚪"} ${triageResult.severity}` },
                { type: "mrkdwn", text: `*MRR at Risk:* $${triageResult.businessImpact?.mrrAtRisk?.toLocaleString() || "0"}` }
              ]
            },
            {
              type: "section",
              text: { type: "mrkdwn", text: `*Acceptance Criteria:*\n${triageResult.acceptanceCriteria?.map((ac: string) => `• ${ac}`).join("\n") || "N/A"}` }
            },
            {
              type: "section",
              text: { type: "mrkdwn", text: `*Labels:* ${triageResult.labels?.map((l: string) => `\`${l}\``).join(" ") || "N/A"}` }
            },
            {
              type: "context",
              elements: [
                { type: "mrkdwn", text: `Auto-triaged by *AI PM Triage Tool* from <@${userId}>'s message` }
              ]
            }
          ]
        });
      }

      console.log(`🔗 Slack: Triaged message from channel ${channel} → "${triageResult.title}" (${triageResult.severity})`);
      return NextResponse.json({ ok: true, triaged: true, title: triageResult.title });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Slack Connector Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
