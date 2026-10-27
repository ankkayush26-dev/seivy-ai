i
import "dotenv/config";
import express from "express";
import rateLimit from "express-rate-limit";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL = "llama-3.3-70b-versatile";

app.disable("x-powered-by");
app.use(express.json({ limit: "30kb" }));
app.use(express.static(path.join(__dirname, "public")));

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 15,
  standardHeaders: "draft-7",
  legacyHeaders: false
});

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    aiConfigured: Boolean(GROQ_API_KEY),
    provider: "groq"
  });
});

app.post("/api/chat", chatLimiter, async (req, res) => {
  try {
    if (!GROQ_API_KEY) {
      return res.status(503).json({
        error: "AI abhi configure nahi hua hai."
      });
    }

    const messages = req.body?.messages;

    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 20) {
      return res.status(400).json({
        error: "Please send between 1 and 20 messages."
      });
    }

    const safeMessages = messages
      .filter(m => m && ["user", "assistant", "system"].includes(m.role))
      .map(m => ({
        role: m.role,
        content: String(m.content ?? "")
      }));

    if (!safeMessages.length) {
      return res.status(400).json({ error: "No valid messages found." });
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: MODEL,
          messages: safeMessages,
          stream: false
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq API error:", data);
      return res.status(502).json({
        error: "AI se reply nahi aaya. Thodi der baad try karo."
      });
    }

    const reply = data.choices?.[0]?.message?.content ?? "";
    return res.json({ reply, message: reply });
  } catch (error) {
    console.error("Chat request failed:", error.message);
    return res.status(502).json({
      error: "AI se connection nahi ho paaya. Dobara try karo."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Seivy AI is running on port ${PORT}`);
});
