import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getMessages, getThreads, postChat } from "../controllers/chatController.js";

export const chatRoutes = Router();

chatRoutes.get("/workspaces/:workspaceId/chat", asyncHandler(getThreads));
chatRoutes.get("/workspaces/:workspaceId/chat/:threadId/messages", asyncHandler(getMessages));
chatRoutes.post("/workspaces/:workspaceId/chat", asyncHandler(postChat));
