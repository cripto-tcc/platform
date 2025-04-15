import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    res.json({ content: completion.choices[0].message.content });
  } catch (error) {
    console.error("Error in chat completion:", error);
    res.status(500).json({ error: "Failed to get chat completion" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
