import { repository } from "../data/repository.js";
import { httpError } from "../utils/httpError.js";
import { buildCitations, buildEvaluation, buildFallbackOutput } from "../agents/fallbackAgents.js";
import { retrieveChunks } from "./retrievalService.js";
import { requireUserRun, requireUserWorkspace } from "./workspaceGuard.js";

const workflowTitles = {
  ask: "Ask Workspace",
  summarize: "Summarize Workspace",
  compare: "Compare Documents",
  meeting_action_items: "Meeting Action Items",
  research_brief: "Research Brief"
};

export async function runWorkflow({ userId, workspaceId, type, input = {} }) {
  await requireUserWorkspace(userId, workspaceId);
  if (type === "compare" && (!Array.isArray(input.documentIds) || input.documentIds.length < 2)) {
    throw httpError(400, "Compare requires at least 2 documents");
  }

  const run = await repository.create("workflow_runs", {
    userId,
    workspaceId,
    type,
    status: "queued",
    title: workflowTitles[type],
    input,
    trace: [{ stage: "Queued", status: "completed", message: "Run created" }]
  });

  try {
    await repository.updateById("workflow_runs", run.id, {
      status: "running",
      trace: [...run.trace, { stage: "Planner", status: "completed", message: "Built deterministic retrieval plan" }]
    });

    const query = input.question || input.prompt || input.topic || workflowTitles[type];
    const chunks = await retrieveChunks({
      userId,
      workspaceId,
      query,
      documentIds: input.documentIds || []
    });
    const citations = buildCitations(chunks);
    const output = buildFallbackOutput(type, input, chunks);
    const evaluation = buildEvaluation(chunks);
    const trace = [
      { stage: "Planner", status: "completed", message: "Planned workflow and retrieval query" },
      { stage: "Retriever", status: "completed", message: `Retrieved ${chunks.length} chunks` },
      { stage: "Task", status: "completed", message: "Generated grounded fallback result" },
      { stage: "Writer", status: "completed", message: "Formatted output JSON" },
      { stage: "Evaluator", status: "completed", message: evaluation.note }
    ];

    return repository.updateById("workflow_runs", run.id, {
      status: "completed",
      output,
      citations,
      evaluation,
      trace
    });
  } catch (error) {
    const failed = await repository.updateById("workflow_runs", run.id, {
      status: "failed",
      trace: [{ stage: "Error", status: "failed", message: error.message || "Workflow failed" }]
    });
    throw httpError(500, failed.trace[0].message);
  }
}

export async function getRun(userId, runId) {
  return requireUserRun(userId, runId);
}
