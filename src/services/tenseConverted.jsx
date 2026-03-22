/**
 * tenseConverted.jsx  — AI helper functions
 *
 * Previously called api.groq.com directly from the browser, exposing
 * VITE_KEY_GROQ in the bundle. Now calls our own Flask proxy instead.
 * The Groq API key lives only on the server.
 */
import api from "../components/api";   // your existing axios instance with the JWT header

export async function convert_tense(sentence) {
  const res = await api.post("/api/v1/ai/convert-tense", { sentence });
  return res.data.result;
}

export async function create_description(data) {
  const res = await api.post("/api/v1/ai/create-description", { data });
  return res.data.result;
}
