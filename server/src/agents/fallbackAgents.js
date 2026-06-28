import { summarizeText } from "../services/chunkService.js";

function citationsFromChunks(chunks) {
  return chunks.map((chunk) => ({
    documentId: chunk.documentId,
    documentName: chunk.documentName,
    snippet: chunk.snippet,
    score: chunk.score
  }));
}

function keySentences(chunks, max = 5) {
  return chunks
    .flatMap((chunk) => chunk.text.match(/[^.!?\n]+[.!?]?/g) || [])
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 20)
    .slice(0, max);
}

export function buildFallbackOutput(type, input, chunks) {
  const sentences = keySentences(chunks, 8);
  const joined = chunks.map((chunk) => chunk.text).join("\n\n");

  if (type === "ask") {
    return { answer: sentences.slice(0, 4).join(" ") || "I could not find enough grounded document context to answer that." };
  }
  if (type === "summarize") {
    return { summary: summarizeText(joined), keyPoints: sentences.slice(0, 5) };
  }
  if (type === "compare") {
    const byDocument = new Map();
    for (const chunk of chunks) byDocument.set(chunk.documentId, chunk);
    return {
      overview: "Comparison generated from the most relevant retrieved chunks.",
      similarities: sentences.slice(0, 3),
      differences: sentences.slice(3, 6),
      documentTakeaways: [...byDocument.values()].map((chunk) => ({
        documentId: chunk.documentId,
        documentName: chunk.documentName,
        takeaway: summarizeText(chunk.text)
      }))
    };
  }
  if (type === "meeting_action_items") {
    const actionLines = joined
      .split(/\n|\. /)
      .map((line) => line.trim())
      .filter((line) => /(todo|action|follow up|must|should|need to|assign|prepare|review)/i.test(line))
      .slice(0, 8);
    return {
      summary: summarizeText(joined),
      actionItems: (actionLines.length ? actionLines : sentences.slice(0, 3)).map((line) => ({
        task: line,
        owner: "Unassigned",
        priority: /urgent|must|critical/i.test(line) ? "high" : "medium",
        dueNote: "Not specified"
      }))
    };
  }
  return {
    title: input.topic || "Research Brief",
    executiveSummary: summarizeText(joined),
    themes: [
      { heading: "Key Findings", details: sentences.slice(0, 3) },
      { heading: "Supporting Context", details: sentences.slice(3, 6) }
    ],
    conclusion: sentences[6] || "The brief is based on the available retrieved document context."
  };
}

export function buildEvaluation(chunks) {
  return {
    note: chunks.length ? "Grounded in retrieved workspace chunks with deterministic fallback logic." : "Low context available for this run.",
    confidence: chunks.length >= 3 ? "medium" : "low"
  };
}

export function buildCitations(chunks) {
  return citationsFromChunks(chunks);
}
