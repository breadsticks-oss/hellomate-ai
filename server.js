app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;
    if (!userMessage) return res.status(400).json({ reply: "No message provided" });

    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/bigscience/bloom-560m",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: userMessage,
          parameters: { max_new_tokens: 150 }
        })
      }
    );

    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } 
    catch { return res.json({ reply: "HF API Error: " + text }); }

    const reply = Array.isArray(data) && data[0]?.generated_text
      ? data[0].generated_text
      : data.generated_text || "AI did not respond";

    res.json({ reply });
  } catch (err) {
    res.status(500).json({ reply: "Server Error: " + err.message });
  }
});
