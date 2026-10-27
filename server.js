import "dotenv/config";
import express from "express";
import rateLimit from "express-rate-limit";
import OpenAI from "openai";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

app.disable("x-powered-by");
app.use(express.json({ limit: "30kb" }));
app.use(express.static(path.join(__dirname, "public")));

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 15,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many messages too quickly. Please wait a minute and try again." }
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, aiConfigured: Boolean(process.env.OPENAI_API_KEY) });
});

app.post("/api/chat", chatLimiter, async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        error: "AI is not configured yet. Add OPENAI_API_KEY to your .env file and restart the server."
      });
    }

    const messages = req.body?.messages;
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 20) {
      return res.status(400).json({ error: "Please send between 1 and 20 recent messages." });
    }

    const safeMessages = [];
    for (const item of messages) {
      if (!item || !["user", "assistant"].includes(item.role) || typeof item.content !== "string") {
        return res.status(400).json({ error: "Invalid message format." });
      }
      const content = item.content.trim();
      if (!content || content.length > 4000) {
        return res.status(400).json({ error: "Each message must be between 1 and 4000 characters." });
      }
      safeMessages.push({ role: item.role, content });
    }

    if (safeMessages[safeMessages.length - 1].role !== "user") {
      return res.status(400).json({ error: "The last message must be from the user." });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      instructions:
        "You are Seivy AI, a helpful, friendly assistant. Give clear, accurate answers. " +
        "If the user writes in Hinglish or Hindi, respond naturally in that language. " +
        "Be honest when uncertain. Do not claim to be ChatGPT or OpenAI.",
      input: safeMessages
    });

    res.json({ reply: response.output_text || "Sorry, I couldn't create a response. Please try again." });
  } catch (error) {
    console.error("Chat request failed:", error?.status || error?.message || "Unknown error");
    const status = error?.status === 401 ? 502 : 500;
    res.status(status).json({
      error: error?.status === 401
        ? "The AI API key was rejected. Check your key in .env."
        : "Something went wrong while contacting the AI. Please try again."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Seivy AI is running at http://localhost:${PORT}`);
});
