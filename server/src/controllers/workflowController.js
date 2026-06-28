import { repository } from "../data/repository.js";
import { getRun, runWorkflow } from "../services/workflowService.js";
import { requireUserWorkspace } from "../services/workspaceGuard.js";

export async function listRuns(req, res) {
  await requireUserWorkspace(req.user.id, req.params.workspaceId);
  const runs = await repository.getAll("workflow_runs", { userId: req.user.id, workspaceId: req.params.workspaceId }, { createdAt: -1 });
  res.json({ runs });
}

export async function getRunById(req, res) {
  res.json({ run: await getRun(req.user.id, req.params.id) });
}

export async function summarize(req, res) {
  res.status(201).json({ run: await runWorkflow({ userId: req.user.id, workspaceId: req.params.workspaceId, type: "summarize", input: req.body }) });
}

export async function compare(req, res) {
  res.status(201).json({ run: await runWorkflow({ userId: req.user.id, workspaceId: req.params.workspaceId, type: "compare", input: req.body }) });
}

export async function meetingActionItems(req, res) {
  res.status(201).json({ run: await runWorkflow({ userId: req.user.id, workspaceId: req.params.workspaceId, type: "meeting_action_items", input: req.body }) });
}

export async function researchBrief(req, res) {
  res.status(201).json({ run: await runWorkflow({ userId: req.user.id, workspaceId: req.params.workspaceId, type: "research_brief", input: req.body }) });
}
