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
