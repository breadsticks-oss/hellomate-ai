import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const HF_API_KEY = process.env.HF_API_KEY;

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;
    if (!userMessage) {
      return res.status(400).json({ reply: "No message provided" });
    }

    // ✅ Correct router endpoint
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: userMessage,
          parameters: { max_new_tokens: 200 }
        })
      }
    );

    // ✅ Safely handle responses (some return text, some JSON)
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.json({ reply: "HF API Error: " + text });
    }

    if (data.error) {
      return res.json({ reply: "HF API Error: " + data.error });
    }

    const reply =
      Array.isArray(data) && data[0]?.generated_text
        ? data[0].generated_text
        : data.generated_text || "AI did not respond";

    res.json({ reply });
  } catch (err) {
    res.status(500).json({ reply: "Server Error: " + err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
