// src/services/gemini.ts
const aiCache = new Map<string, string>();
let lastCallTime = 0;
const RATE_LIMIT_MS = 2000;

export async function getGeminiReply(
  promptMessages: { role: string; parts: { text: string }[] }[]
) {
  try {
    const key = JSON.stringify(promptMessages);

    if (aiCache.has(key)) {
      console.log("Using cached AI response");
      return aiCache.get(key)!;
    }

    const now = Date.now();
    if (now - lastCallTime < RATE_LIMIT_MS) {
      const wait = ((RATE_LIMIT_MS - (now - lastCallTime)) / 1000).toFixed(1);
      throw new Error(`Too many requests. Please wait ${wait}s before next message.`);
    }
    lastCallTime = now;

    const response = await fetch('http://localhost:3001/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ promptMessages }),
    });

    if (!response.ok) throw new Error('Failed to fetch AI response');
    const data = await response.json();

    const aiText = data.text || "Sorry, I couldn't get a reply from the AI.";

    aiCache.set(key, aiText);

    return aiText;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I couldn't get a reply from the AI.";
  }
}
