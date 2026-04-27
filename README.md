# AI PM Triage Tool

This project provides an automated triage system for customer feedback using Google Gemini.

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure API Key**:
   Create a `.env.local` file (if not already present) and add your [Gemini API Key](https://aistudio.google.com/app/apikey):
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

## API Endpoint: `/api/triage`

**Method**: `POST`

**Request Body**:
```json
{
  "feedback": "I was trying to upload my profile picture but it just keeps spinning and then says error 500. This is super annoying I need it for the launch tomorrow!!"
}
```

**Response**:
```json
{
  "title": "Profile picture upload failure (HTTP 500 error)",
  "severity": "High",
  "acceptanceCriteria": [
    "Users can successfully upload profile pictures without errors.",
    "The 500 error is resolved and proper error handling is implemented.",
    "Upload speed is optimized for larger images."
  ]
}
```

## How it Works
The tool uses the `@google/generative-ai` SDK with **Structured Output (JSON Schema)** to ensure the AI always returns a clean, parseable JSON object.
