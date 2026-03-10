const OpenAI = require("openai");
const ChatMessage = require("../models/ChatMessage");
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// POST /chat
exports.chatbotReply = async (req, res) => {
  try {
    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are an AI assistant inside a Skill Swap learning platform.",
        },
        {
          role: "user",
          content: req.body.message,
        },
      ],
    });

    const reply = completion.choices[0].message.content;

    await ChatMessage.create({
      user: req.user._id,
      role: "user",
      text: req.body.message,
    });

    await ChatMessage.create({
      user: req.user._id,
      role: "bot",
      text: reply,
    });

    res.json({ reply });
  } catch (err) {
    console.error("AI ERROR:", err);
    res.status(500).json({ reply: "AI failed" });
  }
};

// GET /history
exports.getChatHistory = async (req, res) => {
  const messages = await ChatMessage.find({ user: req.user._id })
    .sort({ createdAt: 1 })
    .limit(200);

  res.json(messages);
};