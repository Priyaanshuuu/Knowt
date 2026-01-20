Knowt
A multi-modal AI study tool that turns raw content (PDFs, Videos, URLs) into structured notes and quizzes.

I built this because copy-pasting text into ChatGPT is tedious. Knowt handles the ingestion pipeline for you—extracting text from messy sources like hour-long YouTube lectures or scanned PDFs—and runs them through high-speed inference models to create study guides.

Live Demo: https://knowt-1.onrender.com/

🏗 The Tech Stack
I chose this stack to balance speed (for the user) and cost (for me).

Frontend: Next.js 14 (App Router) + TypeScript.

Why: Needed Server Actions for the ingestion pipeline to keep client-side logic clean.

Database: PostgreSQL (hosted on Neon) + Prisma ORM.

Why: Relational data was necessary to link Documents -> Summaries -> Q&A Pairs.

AI Inference:

Groq (Llama 3-70b): Used for the heavy lifting (summarization). It processes tokens 10x faster than GPT-4, which is crucial when summarizing a 50-page PDF in under 5 seconds.

OpenAI (GPT-4o): Used strictly for "Reasoning" tasks like generating quiz questions where logic matters more than speed.

Storage: ImageKit.

Why: Handles file uploads and optimizes images on the fly.

Styling: Tailwind CSS + Shadcn UI.

⚙️ How It Works (The Pipeline)
The core challenge was handling long-running processes (like transcribing a 1GB video) without timing out the serverless function. Here is the architecture I implemented:

1. The Ingestion Layer
Instead of a simple upload, the system routes inputs based on type:

PDFs: Parsed using pdf-parse. I had to write a custom cleaner to strip out headers/footers that usually confuse the LLM.

YouTube: I used ytdl-core to extract the transcript directly. If no transcript exists, it falls back to audio extraction (WIP).

Web Scraper: A lightweight Cheerio scraper fetches article text while ignoring navbars and ads.

2. The "Hybrid" AI Pipeline
To keep the app feeling "real-time," I don't send everything to one model.

Extraction: Raw text is chunked to fit context windows.

Fast Pass (Groq): The chunks are sent to Groq. This runs extremely fast (~300 tokens/sec).

Refinement (OpenAI): The structured output is validated by GPT-4o only if complex reasoning (like "Compare X and Y") is requested.

3. Status Polling (Handling Latency)
Since video transcription can take 10+ seconds, I couldn't use a standard await.

I implemented a polling mechanism.

When a job starts, the UI receives a jobId.

The client polls /api/status every 2s.

The backend updates the status from PROCESSING_PDF -> GENERATING_SUMMARY -> COMPLETED.

📂 Local Setup
If you want to run this locally, you'll need API keys for Groq and OpenAI.

Clone the repo:

Bash

git clone https://github.com/Priyaanshuuu/knowt.git
cd knowt
Install dependencies:

Bash

npm install
Set up environment: Rename .env.example to .env and add your keys:

Bash

DATABASE_URL="postgresql://..."
GROQ_API_KEY="gsk_..."
OPENAI_API_KEY="sk_..."
NEXT_PUBLIC_IMAGEKIT_ENDPOINT="https://..."
Sync the DB:

Bash

npx prisma db push
Run it:

Bash

npm run dev
🚧 Current Limitations / To-Do
Video Limits: Currently caps YouTube videos at 30 minutes to avoid hitting Vercel's execution limits. Moving this to a background worker (Redis/BullMQ) is the next step.

OCR: Scanned PDFs (images) are hit-or-miss. Need to integrate Tesseract.js for better optical recognition.

Author: Priyanshu Sinha
