import fs from "fs/promises";
import path from "path";
import { repository } from "../data/repository.js";
import { httpError } from "../utils/httpError.js";
import { chunkText, cleanText, summarizeText } from "./chunkService.js";
import { embedText } from "./ollamaService.js";
import { extractTextFromFile, fileTypeFromMime } from "./extractionService.js";
import { requireUserDocument, requireUserWorkspace } from "./workspaceGuard.js";

export const allowedMimeTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
  "text/csv",
  "image/png",
  "image/jpeg",
  "image/webp"
];

export async function createUploadedDocument({ userId, workspaceId, file }) {
  await requireUserWorkspace(userId, workspaceId);
  const fileType = fileTypeFromMime(file.mimetype, file.originalname);
  if (!fileType) throw httpError(400, "Unsupported file type");

  const document = await repository.create("documents", {
    userId,
    workspaceId,
    originalName: file.originalname,
    storedName: file.filename,
    mimeType: file.mimetype,
    size: file.size,
    fileType,
    status: "uploaded",
    metadata: { path: file.path }
  });

  await processDocument(document.id);
  return repository.getById("documents", document.id);
}

export async function processDocument(documentId) {
  const document = await repository.getById("documents", documentId);
  if (!document) return null;

  await repository.updateById("documents", document.id, { status: "processing", processingError: "" });
  await repository.deleteWhere("document_chunks", { documentId: document.id });

  try {
    const { text, pageCount } = await extractTextFromFile(document.metadata.path, document.fileType);
    const extractedText = cleanText(text);
    if (extractedText.length < 10) throw httpError(422, "Could not extract enough text from document");

    const summary = summarizeText(extractedText);
    const chunks = chunkText(extractedText);

    for (const chunk of chunks) {
      const embedding = await embedText(chunk.text);
      await repository.create("document_chunks", {
        userId: document.userId,
        workspaceId: document.workspaceId,
        documentId: document.id,
        ...chunk,
        embedding,
        metadata: { documentName: document.originalName }
      });
    }

    return repository.updateById("documents", document.id, {
      status: "ready",
      extractedText,
      summary,
      pageCount
    });
  } catch (error) {
    return repository.updateById("documents", document.id, {
      status: "failed",
      processingError: error.message || "Document processing failed"
    });
  }
}

export async function deleteDocument(userId, documentId) {
  const document = await requireUserDocument(userId, documentId);
  await repository.deleteWhere("document_chunks", { userId, documentId });
  await repository.deleteById("documents", document.id);
  if (document.metadata?.path) {
    try {
      await fs.unlink(path.resolve(document.metadata.path));
    } catch {
      // The database record is the source of truth; missing files should not block deletion.
    }
  }
}
