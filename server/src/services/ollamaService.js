import { env } from "../config/env.js";

async function postJson(path, body) {
  const response = await fetch(`${env.ollamaBaseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(3500)
  });
  if (!response.ok) throw new Error("Ollama request failed");
  return response.json();
}

export async function embedText(text) {
  try {
    const data = await postJson("/api/embeddings", {
      model: env.ollamaEmbedModel,
      prompt: text.slice(0, 4000)
    });
    return Array.isArray(data.embedding) ? data.embedding : [];
  } catch {
    return [];
  }
}
