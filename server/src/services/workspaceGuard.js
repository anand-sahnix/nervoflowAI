import { repository } from "../data/repository.js";
import { httpError } from "../utils/httpError.js";

export async function requireUserWorkspace(userId, workspaceId) {
  const workspace = await repository.getById("workspaces", workspaceId);
  if (!workspace || workspace.userId !== userId) throw httpError(404, "Workspace not found");
  return workspace;
}

export async function requireUserDocument(userId, documentId) {
  const document = await repository.getById("documents", documentId);
  if (!document || document.userId !== userId) throw httpError(404, "Document not found");
  return document;
}

export async function requireUserRun(userId, runId) {
  const run = await repository.getById("workflow_runs", runId);
  if (!run || run.userId !== userId) throw httpError(404, "Run not found");
  return run;
}
