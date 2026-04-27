# ⚡ TRIAGE: AI PM Command Center (God Mode)

![Banner](https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop)

> **Transform raw, messy customer signals into surgical engineering tickets.** Built for Senior PMs and Engineering Leads who need "God Mode" over their product feedback.

---

## 🎨 Design Philosophy
Triage follows the **"Linear + Raycast"** aesthetic:
- **Dark Mode First**: #0a0a0f canvas with 40px surgical grid.
- **Glassmorphism**: Backdrop blurs and subtle white borders for a premium depth.
- **Motion Engine**: Framer Motion transitions for every state change.
- **Typography**: Syne (UI) and JetBrains Mono (Technical Metadata).

---

## 🚀 Core Capabilities

### 🧠 Multimodal Triage Engine
Powered by **Gemini 2.5 Flash**, the Command Center ingests:
- **Raw Text**: Messy rants, Slack screenshots, and vague complaints.
- **Multimodal Files**: PDFs, Excel sheets, CSVs, and even **Video Transcripts**.
- **Agentic Output**: Structured JSON with Title, Severity, Business Impact (MRR at Risk), and full PRD generation.

### 🛠️ Strategic Connectors
- **GitHub**: One-click "Push to Issue" with automatic labeling.
- **Slack**: Inbound webhook forwarding for live customer signals.
- **Zoom**: Automatic recording ingestion for meeting-to-ticket workflows.
- **Real-Time Feed**: A live sidecar displaying global engineering activity.

### 📊 Batch Analytics
Panoramic view of high-volume feedback. Identify clusters of pain points and calculate the **Total MRR at Risk** across your entire user base.

---

## 🛠️ Tech Stack
- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
- **AI Engine**: [Google Gemini 2.5 Flash](https://ai.google.dev/)
- **Database**: [Neon Postgres (Serverless)](https://neon.tech/)
- **Auth**: [NextAuth.js v5](https://next-auth.js.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

---

## ⚙️ Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/adityacs50-lab/ai-pm-demo.git
cd ai-pm-demo
npm install
```

### 2. Environment Setup
Create a `.env.local` file with the following:
```env
# AI & Database
GEMINI_API_KEY=your_key
DATABASE_URL=your_neon_url

# Integrations
GITHUB_PAT=your_pat
GITHUB_OWNER=your_username
GITHUB_REPO=your_repo

# Auth
NEXTAUTH_SECRET=your_secret
GITHUB_CLIENT_ID=your_id
GITHUB_CLIENT_SECRET=your_secret
```

### 3. Launch
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) and enter **God Mode**.

---

## 🔒 Security Protocol
- **Auto-Escalation**: System triggers CRITICAL priority on PII or vulnerability detection.
- **Multi-User Isolation**: Database level security ensuring users only see their own triage history.

---

<div align="center">
  <sub>Built with ❤️ for Y Combinator by Aditya & Antigravity</sub>
</div>
