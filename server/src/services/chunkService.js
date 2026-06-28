export function cleanText(text = "") {
  return text.replace(/\r/g, "\n").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

export function summarizeText(text = "") {
  const sentences = text.match(/[^.!?\n]+[.!?]?/g) || [];
  return sentences.slice(0, 3).join(" ").trim() || text.slice(0, 240);
}

export function chunkText(text, targetSize = 1200, overlap = 200) {
  const paragraphs = cleanText(text).split(/\n\s*\n/).filter(Boolean);
  const chunks = [];
  let current = "";

  for (const paragraph of paragraphs) {
    if ((current + "\n\n" + paragraph).length <= targetSize) {
      current = current ? `${current}\n\n${paragraph}` : paragraph;
      continue;
    }
    if (current) chunks.push(current);
    if (paragraph.length <= targetSize) {
      current = paragraph;
    } else {
      for (let start = 0; start < paragraph.length; start += targetSize - overlap) {
        chunks.push(paragraph.slice(start, start + targetSize));
      }
      current = "";
    }
  }

  if (current) chunks.push(current);
  return chunks.map((chunk, index) => ({
    chunkIndex: index,
    text: chunk,
    tokenCountApprox: Math.ceil(chunk.length / 4)
  }));
}
