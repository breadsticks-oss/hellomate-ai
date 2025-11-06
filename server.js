import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Secret key from environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    // Check if userMessage exists
    if (!userMessage) {
      return res.status(400).json({ reply: "No message provided" });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a friendly chatbot named HELLO MATE." },
          { role: "user", content: userMessage }
        ]
      })
    });

    const data = await response.json();

    // Safe check for choices array
    if (data.choices && data.choices[0] && data.choices[0].message) {
      res.json({ reply: data.choices[0].message.content });
    } else if (data.error) {
      // OpenAI API returned an error
      res.json({ reply: "OpenAI Error: " + data.error.message });
    } else {
      // Unknown response format
      res.json({ reply: "Unknown error from AI" });
    }

  } catch (err) {
    // Catch any other errors
    res.status(500).json({ reply: "Server Error: " + err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
