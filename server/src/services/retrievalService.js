import { repository } from "../data/repository.js";
import { embedText } from "./ollamaService.js";

function cosine(a = [], b = []) {
  if (!a.length || !b.length || a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let index = 0; index < a.length; index += 1) {
    dot += a[index] * b[index];
    normA += a[index] * a[index];
    normB += b[index] * b[index];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
}

function keywordScore(query, text) {
  const queryWords = new Set(String(query).toLowerCase().match(/[a-z0-9]+/g) || []);
  const textWords = new Set(String(text).toLowerCase().match(/[a-z0-9]+/g) || []);
  let score = 0;
  for (const word of queryWords) if (textWords.has(word)) score += 1;
  return score / Math.max(queryWords.size, 1);
}

export async function retrieveChunks({ userId, workspaceId, query, documentIds = [], topK = 5 }) {
  let chunks = await repository.getAll("document_chunks", { userId, workspaceId });
  if (documentIds.length) chunks = chunks.filter((chunk) => documentIds.includes(chunk.documentId));

  const queryEmbedding = await embedText(query || "");
  const scored = chunks.map((chunk) => {
    const embeddingScore = queryEmbedding.length && chunk.embedding?.length ? cosine(queryEmbedding, chunk.embedding) : 0;
    const score = embeddingScore || keywordScore(query, chunk.text);
    return { ...chunk, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, topK);
  return Promise.all(
    top.map(async (chunk) => {
      const document = await repository.getById("documents", chunk.documentId);
      return {
        chunkId: chunk.id,
        documentId: chunk.documentId,
        documentName: document?.originalName || chunk.metadata?.documentName || "Document",
        snippet: chunk.text.slice(0, 420),
        text: chunk.text,
        score: chunk.score
      };
    })
  );
}
