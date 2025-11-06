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

    const response = await fetch("https://router.huggingface.co/hf-inference/tiiuae/falcon-7b-instruct", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: userMessage })
    });

    const data = await response.json();

    if (data.error) return res.json({ reply: "HF API Error: " + data.error });

    const text = Array.isArray(data) ? data[0].generated_text : data.generated_text;
    res.json({ reply: text || "AI did not respond" });

  } catch (err) {
    res.status(500).json({ reply: "Server Error: " + err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
