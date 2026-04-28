# ⚡ Cursor for Product Managers

<div align="center">
  <img src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop" alt="Cursor for PMs Banner" style="border-radius: 12px; margin-bottom: 24px;" />
</div>

> **The missing Product Management layer for Agentic Engineering.** Convert messy customer interviews into surgical, cross-validated execution plans for AI coding agents.

Built in response to the [Y Combinator RFS: Cursor for Product Managers](https://www.ycombinator.com/rfs#cursor-for-product-managers).

---

## 🚀 The Problem

AI tools like **Cursor** and **Claude Code** are incredible at building software *once it's clear what needs to be built*. But writing code is only 50% of the battle.

Figuring out what to build requires reading raw user feedback, tracking cross-customer pain points, and writing precise engineering specs. Currently, there is no system designed to seamlessly link qualitative customer discovery with agentic code generation.

## 🧠 Multi-Transcript Discovery Engine

**Cursor for PMs** solves the "What to build" problem by acting as an AI Principal Product Engineer.

- **Cross-Customer Synthesis:** Drop in `N` number of raw customer transcripts. The Discovery Engine processes them simultaneously to find recurring patterns across different users.
- **High Signal, Zero Fluff:** Generates specifications using strictly verbatim quotes, ranked by frequency. Zero MBA jargon allowed.
- **Agent-Ready Output:** Automatically breaks down the most requested feature into a concrete `AGENT EXECUTION PLAN` with precise `/app` directory file paths so you can copy-paste directly into Cursor.

---

## 🎨 Interface & UX

Designed to feel like a high-end developer tool, not another generic SaaS dashboard:
- **Dark Mode First**: Deep `#0a0a0a` canvas with subtle borders for premium depth.
- **Split-Pane Architecture**: Left side for data ingestion, right side for generated specifications.
- **Strictly Typed UI**: Everything from the UI to the AI system prompt enforces strict constraints to prevent hallucinations.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js App Router](https://nextjs.org/)
- **Intelligence**: [Google Gemini 2.5 Flash](https://ai.google.dev/) (Strict JSON Schema + Prompt Engineering)
- **Database**: [Neon Postgres (Serverless)](https://neon.tech/)
- **Auth**: [NextAuth.js (GitHub Provider)](https://next-auth.js.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Deployment**: [Vercel](https://vercel.com/)

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

# Auth
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
GITHUB_CLIENT_ID=your_id
GITHUB_CLIENT_SECRET=your_secret
```

### 3. Launch
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to start your first Discovery Session.

---

<div align="center">
  <sub>Built with ❤️ for the Y Combinator Application by Aditya & Antigravity</sub>
</div>
