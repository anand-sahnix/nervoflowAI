import { askWorkspace, listMessages, listThreads } from "../services/chatService.js";
import { httpError } from "../utils/httpError.js";

export async function getThreads(req, res) {
  res.json({ threads: await listThreads(req.user.id, req.params.workspaceId) });
}

export async function getMessages(req, res) {
  res.json({ messages: await listMessages(req.user.id, req.params.workspaceId, req.params.threadId) });
}

export async function postChat(req, res) {
  if (!req.body.question) throw httpError(400, "Question is required");
  res.status(201).json(await askWorkspace({
    userId: req.user.id,
    workspaceId: req.params.workspaceId,
    question: req.body.question,
    threadId: req.body.threadId
  }));
}
