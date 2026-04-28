const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

require('dotenv').config({ path: '.env.local' });

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("Missing GEMINI_API_KEY");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

const historicalBugs = [
  {
    id: "BUG-2024-811",
    issue: "Razorpay webhook timeout during peak hours. Payments succeed but users don't get the confirmation page, resulting in double charges.",
    resolution: "Implemented exponential backoff on webhook processing and added a 5-minute idempotency lock on checkout sessions.",
    severity: "Critical",
    mrr_saved: 120000
  },
  {
    id: "BUG-2023-902",
    issue: "Users on the Free tier are able to access Pro features by manipulating the localstorage JWT token.",
    resolution: "Moved tier validation to server-side middleware and enforced strict JWT signing verification.",
    severity: "Critical",
    mrr_saved: 45000
  },
  {
    id: "BUG-2024-112",
    issue: "Stripe checkout modal fails to render on Safari mobile if the user has strict privacy settings enabled.",
    resolution: "Switched from cross-domain iframe to server-side redirect checkout flow.",
    severity: "High",
    mrr_saved: 15000
  },
  {
    id: "BUG-2023-441",
    issue: "Dashboard analytics take over 10 seconds to load for enterprise users with more than 10,000 transactions.",
    resolution: "Added Redis caching layer and materialized views in PostgreSQL for historical metrics.",
    severity: "Medium",
    mrr_saved: 5000
  },
  {
    id: "BUG-2024-009",
    issue: "Refund API intermittently returns a 502 Bad Gateway when processing bulk refunds.",
    resolution: "Increased API gateway timeout threshold from 30s to 60s and implemented a queue worker for bulk tasks.",
    severity: "High",
    mrr_saved: 20000
  }
];

async function seedVectorStore() {
  console.log("🚀 Initializing Local Vector Store for RAG...");
  const model = genAI.getGenerativeModel({ model: "embedding-001" });
  
  const vectorStore = [];

  for (const bug of historicalBugs) {
    try {
      console.log(`Embedding ${bug.id}...`);
      const result = await model.embedContent(bug.issue);
      const embedding = result.embedding.values;
      
      vectorStore.push({
        ...bug,
        embedding: embedding
      });
    } catch (e) {
      console.error(`Failed to embed ${bug.id}`, e);
    }
  }

  const outputPath = path.join(__dirname, "vector_store.json");
  fs.writeFileSync(outputPath, JSON.stringify(vectorStore, null, 2));
  console.log(`✅ Success! Seeded ${vectorStore.length} historical bugs into ${outputPath}`);
  console.log("Deep Tech RAG Pipeline is now ready for similarity search.");
}

seedVectorStore();
