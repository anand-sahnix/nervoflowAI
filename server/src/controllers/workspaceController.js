import { repository } from "../data/repository.js";
import { httpError } from "../utils/httpError.js";

async function findUserWorkspace(userId, workspaceId) {
  const workspace = await repository.getById("workspaces", workspaceId);
  if (!workspace || workspace.userId !== userId) throw httpError(404, "Workspace not found");
  return workspace;
}

export async function listWorkspaces(req, res) {
  const workspaces = await repository.getAll("workspaces", { userId: req.user.id }, { createdAt: -1 });
  res.json({ workspaces });
}

export async function createWorkspace(req, res) {
  if (!req.body.name) throw httpError(400, "Workspace name is required");
  const workspace = await repository.create("workspaces", {
    userId: req.user.id,
    name: req.body.name.trim(),
    description: req.body.description || "",
    color: req.body.color || "#2563eb"
  });
  res.status(201).json({ workspace });
}

export async function getWorkspace(req, res) {
  const workspace = await findUserWorkspace(req.user.id, req.params.id);
  const [documentCount, readyDocumentCount, runCount] = await Promise.all([
    repository.count("documents", { userId: req.user.id, workspaceId: workspace.id }),
    repository.count("documents", { userId: req.user.id, workspaceId: workspace.id, status: "ready" }),
    repository.count("workflow_runs", { userId: req.user.id, workspaceId: workspace.id })
  ]);
  res.json({ workspace: { ...workspace, stats: { documentCount, readyDocumentCount, runCount } } });
}

export async function updateWorkspace(req, res) {
  const workspace = await findUserWorkspace(req.user.id, req.params.id);
  const updated = await repository.updateById("workspaces", workspace.id, {
    name: req.body.name ?? workspace.name,
    description: req.body.description ?? workspace.description,
    color: req.body.color ?? workspace.color
  });
  res.json({ workspace: updated });
}

export async function deleteWorkspace(req, res) {
  const workspace = await findUserWorkspace(req.user.id, req.params.id);
  await Promise.all([
    repository.deleteWhere("documents", { userId: req.user.id, workspaceId: workspace.id }),
    repository.deleteWhere("document_chunks", { userId: req.user.id, workspaceId: workspace.id }),
    repository.deleteWhere("chat_threads", { userId: req.user.id, workspaceId: workspace.id }),
    repository.deleteWhere("chat_messages", { userId: req.user.id, workspaceId: workspace.id }),
    repository.deleteWhere("workflow_runs", { userId: req.user.id, workspaceId: workspace.id })
  ]);
  await repository.deleteById("workspaces", workspace.id);
  res.json({ message: "Workspace deleted" });
}
