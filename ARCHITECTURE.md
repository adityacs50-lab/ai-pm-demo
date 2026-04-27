# 🏗️ AI PM Triage Tool: Software Architecture

This document outlines the core technical structure of the application. The system is designed as a **Multimodal Intelligence Hub** that bridges raw customer feedback with structured engineering workflows.

---

## 📁 Project Structure (Next.js 14 App Router)

```text
/app
  /api
    /auth         -> NextAuth.js configuration (GitHub OAuth)
    /triage       -> Core AI Engine (Gemini 2.5 Flash)
    /history      -> Database CRUD for triage signals
    /connectors   -> Inbound Webhooks (Slack, Zoom, Email)
    /github       -> Outbound GitHub Issue automation
  /components     -> UI Logic (To be rebuilt by you)
  /lib            -> Database connection & Shared Utilities
  layout.tsx      -> Global Root (Fonts, Auth Providers)
  page.tsx        -> Main Triage State Machine
```

---

## 🧠 Core AI Engine (`/api/triage`)
The heart of the app. It uses **Gemini 2.5 Flash** with **Response Schemas** to ensure 100% valid JSON output.

### Inbound Schema (Form Data)
- `feedback`: string (Raw text)
- `file`: File (PDF/Excel/Video)
- `mode`: "ENTERPRISE" | "PRO" | "FREE"

### Outbound Schema (JSON)
```json
{
  "title": "Concise Bug Title",
  "severity": "Critical | High | Medium | Low",
  "acceptanceCriteria": ["String[]"],
  "labels": ["String[]"],
  "businessImpact": {
    "mrrAtRisk": 5000,
    "reasoning": "Direct link to checkout failure"
  },
  "prd": "# Full Markdown PRD...",
  "securityRisk": "Optional description if threat detected"
}
```

---

## 🗄️ Database Schema (Neon Postgres)
We use a single `tickets` table to store all triage history.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Unique ticket identifier |
| `type` | String | 'individual' or 'batch' |
| `title` | String | AI-generated title |
| `severity` | String | Triage level |
| `full_result` | JSONB | The complete Gemini output object |
| `raw_feedback` | Text | The original input for reference |
| `user_email` | String | For multi-user isolation |
| `created_at` | Timestamp | Auto-generated |

---

## 🔗 Connector Specs

### 1. Slack Connector (`/api/connectors/slack`)
- **Type**: Bot Event Subscription.
- **Logic**: Listens for messages in joined channels → Filters for "feedback-like" keywords → Calls Triage API → Replies in-thread with the ticket.

### 2. Zoom Connector (`/api/connectors/zoom`)
- **Type**: Webhook (Recording Completed).
- **Logic**: Downloads MP4 → Uploads to Gemini File API → Extracts tickets from the **Video/Audio** content directly.

### 3. Email/Webhook Universal
- **Type**: REST POST.
- **Logic**: Accepts raw strings or JSON. The AI dynamically identifies the feedback key within the payload.

---

## 🚀 Deployment & Environment
- **Hosting**: Vercel
- **DB**: Neon (Serverless Postgres)
- **Secrets Required**:
  - `GEMINI_API_KEY`: Google AI Studio
  - `DATABASE_URL`: Neon Connection String
  - `GITHUB_PAT`: For pushing issues to your repo
  - `NEXTAUTH_SECRET`: For session security

---

## 🎯 Frontend Strategy (Your Goal)
1.  **State Management**: Use `useState` to track `currentView` (Input vs Result).
2.  **Ingestion**: Build a clean form that sends `FormData` to `/api/triage`.
3.  **History**: Fetch from `/api/history` to populate a sidebar.
4.  **Display**: Render the `full_result` JSON using structured cards and a Markdown renderer for the PRD.
