import { repository } from "../data/repository.js";
import { runWorkflow } from "./workflowService.js";
import { requireUserWorkspace } from "./workspaceGuard.js";

export async function listThreads(userId, workspaceId) {
  await requireUserWorkspace(userId, workspaceId);
  return repository.getAll("chat_threads", { userId, workspaceId }, { updatedAt: -1 });
}

export async function listMessages(userId, workspaceId, threadId) {
  await requireUserWorkspace(userId, workspaceId);
  return repository.getAll("chat_messages", { userId, workspaceId, threadId }, { createdAt: 1 });
}

export async function askWorkspace({ userId, workspaceId, question, threadId }) {
  await requireUserWorkspace(userId, workspaceId);
  const thread =
    (threadId && (await repository.getById("chat_threads", threadId))) ||
    (await repository.create("chat_threads", { userId, workspaceId, title: question.slice(0, 60) || "Workspace chat" }));

  await repository.create("chat_messages", { userId, workspaceId, threadId: thread.id, role: "user", content: question, citations: [] });
  const run = await runWorkflow({ userId, workspaceId, type: "ask", input: { question, threadId: thread.id } });
  const assistant = await repository.create("chat_messages", {
    userId,
    workspaceId,
    threadId: thread.id,
    role: "assistant",
    content: run.output.answer,
    citations: run.citations
  });

  return { thread, message: assistant, run };
}
