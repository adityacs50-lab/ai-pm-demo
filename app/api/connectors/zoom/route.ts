import { NextResponse } from "next/server";
import crypto from "crypto";
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import os from "os";

// Zoom Meeting Agent Connector
// 1. Create a Zoom App (Webhook Only or Server-to-Server OAuth)
// 2. Set Webhook URL: https://your-domain/api/connectors/zoom
// 3. Subscribe to "Recording Completed" event
// 4. Add ZOOM_WEBHOOK_SECRET and ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET to .env

const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY || "");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Handle Zoom Webhook URL Validation (CRC)
    if (body.event === "endpoint.url_validation") {
      const plainToken = body.payload.plainToken;
      const hash = crypto
        .createHmac("sha256", process.env.ZOOM_WEBHOOK_SECRET || "")
        .update(plainToken)
        .digest("hex");

      return NextResponse.json({
        plainToken: plainToken,
        verificationToken: hash,
      });
    }

    // 2. Handle Recording Completed
    if (body.event === "recording.completed") {
      const recordingFile = body.payload.object.recording_files.find(
        (f: any) => f.file_type === "MP4"
      );

      if (!recordingFile) {
        return NextResponse.json({ ok: true, message: "No MP4 recording found" });
      }

      console.log(`🎥 Zoom Agent: New recording detected for meeting: ${body.payload.object.topic}`);

      // In a real production environment, we would queue this job.
      // For this agent, we'll try to process it directly (Vercel timeout limits apply).
      
      // We need a Zoom Access Token to download the file
      const zoomAccessToken = await getZoomAccessToken();
      
      const downloadUrl = `${recordingFile.download_url}?access_token=${zoomAccessToken}`;
      
      // Download to /tmp
      const tempPath = path.join(os.tmpdir(), `zoom_${recordingFile.id}.mp4`);
      const response = await fetch(downloadUrl);
      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(tempPath, buffer);

      console.log(`📥 Downloaded Zoom recording: ${tempPath} (${buffer.length} bytes)`);

      // 3. Upload to Gemini File API
      const uploadResult = await fileManager.uploadFile(tempPath, {
        mimeType: "video/mp4",
        displayName: body.payload.object.topic,
      });

      // Wait for processing
      let file = await fileManager.getFile(uploadResult.file.name);
      while (file.state === FileState.PROCESSING) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        file = await fileManager.getFile(uploadResult.file.name);
      }

      if (file.state === FileState.FAILED) {
        throw new Error("Gemini Video Processing Failed");
      }

      // 4. Triage with Gemini
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `
        You are an expert Product Manager. You are watching a recording of a customer meeting.
        Analyze the meeting and extract ALL specific user feedback, bugs, and feature requests.
        For each item found, provide:
        1. A concise, professional title.
        2. Severity (Critical/High/Medium/Low).
        3. A detailed summary of the issue.
        4. Technical acceptance criteria.
        5. Labels (e.g. "bug", "feature", "ux").
        6. Business impact (MRR at risk).

        Return the results as a JSON array of objects following the Triage Schema.
      `;

      const result = await model.generateContent([
        {
          fileData: {
            mimeType: file.mimeType,
            fileUri: file.uri,
          },
        },
        { text: prompt },
      ]);

      const triageResults = JSON.parse(result.response.text());

      // 5. Save results to database
      const origin = new URL(req.url).origin;
      for (const item of triageResults) {
        await fetch(`${origin}/api/history`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "individual",
            result: item,
            customerTier: "Enterprise",
            rawFeedback: `Extracted from Zoom Meeting: ${body.payload.object.topic}`,
          }),
        });
      }

      // Cleanup
      fs.unlinkSync(tempPath);
      await fileManager.deleteFile(file.name);

      console.log(`✅ Zoom Agent: Processed ${triageResults.length} tickets from meeting.`);
      return NextResponse.json({ ok: true, count: triageResults.length });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Zoom Agent Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function getZoomAccessToken() {
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;
  const accountId = process.env.ZOOM_ACCOUNT_ID;

  if (!clientId || !clientSecret || !accountId) {
    throw new Error("Missing Zoom Credentials");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(`https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  const data = await res.json();
  return data.access_token;
}
