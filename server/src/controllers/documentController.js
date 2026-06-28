import { repository } from "../data/repository.js";
import { createUploadedDocument, deleteDocument, processDocument } from "../services/documentService.js";
import { requireUserDocument, requireUserWorkspace } from "../services/workspaceGuard.js";
import { httpError } from "../utils/httpError.js";

export async function listDocuments(req, res) {
  await requireUserWorkspace(req.user.id, req.params.workspaceId);
  const documents = await repository.getAll("documents", { userId: req.user.id, workspaceId: req.params.workspaceId }, { createdAt: -1 });
  res.json({ documents });
}

export async function uploadDocument(req, res) {
  if (!req.file) throw httpError(400, "File is required");
  const document = await createUploadedDocument({ userId: req.user.id, workspaceId: req.params.workspaceId, file: req.file });
  res.status(201).json({ document });
}

export async function getDocument(req, res) {
  const document = await requireUserDocument(req.user.id, req.params.id);
  res.json({ document });
}

export async function reprocessDocument(req, res) {
  const document = await requireUserDocument(req.user.id, req.params.id);
  res.json({ document: await processDocument(document.id) });
}

export async function removeDocument(req, res) {
  await deleteDocument(req.user.id, req.params.id);
  res.json({ message: "Document deleted" });
}
