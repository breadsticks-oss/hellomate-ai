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
    if (!userMessage) return res.status(400).json({ reply: "No message provided" });

    // ✅ use new router endpoint
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/tiiuae/falcon-7b-instruct",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json"
        },
        // ✅ use the correct payload format for router
        body: JSON.stringify({
          inputs: userMessage,
          parameters: { max_new_tokens: 200 }
        })
      }
    );

    // Hugging Face router sometimes returns plain text on error, so we need a safe parse
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

    // ✅ Correct response handling
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
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
