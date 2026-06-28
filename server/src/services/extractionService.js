import fs from "fs/promises";
import pdf from "pdf-parse";
import mammoth from "mammoth";
import sharp from "sharp";
import { createWorker } from "tesseract.js";
import { parse } from "csv-parse/sync";

export function fileTypeFromMime(mimeType, filename = "") {
  const lower = filename.toLowerCase();
  if (mimeType === "application/pdf" || lower.endsWith(".pdf")) return "pdf";
  if (mimeType.includes("wordprocessingml") || lower.endsWith(".docx")) return "docx";
  if (mimeType === "text/plain" || lower.endsWith(".txt")) return "txt";
  if (lower.endsWith(".md")) return "md";
  if (mimeType === "text/csv" || lower.endsWith(".csv")) return "csv";
  if (mimeType.startsWith("image/")) return "image";
  return "";
}

export async function extractTextFromFile(filePath, fileType) {
  if (fileType === "pdf") {
    const data = await pdf(await fs.readFile(filePath));
    return { text: data.text || "", pageCount: data.numpages || 0 };
  }
  if (fileType === "docx") {
    const result = await mammoth.extractRawText({ path: filePath });
    return { text: result.value || "", pageCount: 0 };
  }
  if (fileType === "txt" || fileType === "md") {
    return { text: await fs.readFile(filePath, "utf8"), pageCount: 0 };
  }
  if (fileType === "csv") {
    const rows = parse(await fs.readFile(filePath, "utf8"), { skip_empty_lines: true });
    return { text: rows.map((row) => row.join(" | ")).join("\n"), pageCount: 0 };
  }
  if (fileType === "image") {
    const imageBuffer = await sharp(filePath).grayscale().normalize().toBuffer();
    const worker = await createWorker("eng");
    const result = await worker.recognize(imageBuffer);
    await worker.terminate();
    return { text: result.data.text || "", pageCount: 1 };
  }
  return { text: "", pageCount: 0 };
}
