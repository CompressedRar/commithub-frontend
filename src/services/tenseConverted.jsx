import { Client, PollinationsAI, DeepInfra, Together, Puter, HuggingFace } from  './client';

const groq_token = import.meta.env.KEY_GROQ;

export async function convert_tense(sentence) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${groq_token}`
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: `convert this to paste tense no explanations: ${sentence}` }],
    }),
  });
  const data = await res.json();
  console.log();
  return String(data.choices[0].message.content)

}
