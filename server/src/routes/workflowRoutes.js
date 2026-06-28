import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { compare, getRunById, listRuns, meetingActionItems, researchBrief, summarize } from "../controllers/workflowController.js";

export const workflowRoutes = Router();

workflowRoutes.get("/workspaces/:workspaceId/runs", asyncHandler(listRuns));
workflowRoutes.get("/runs/:id", asyncHandler(getRunById));
workflowRoutes.post("/workspaces/:workspaceId/runs/summarize", asyncHandler(summarize));
workflowRoutes.post("/workspaces/:workspaceId/runs/compare", asyncHandler(compare));
workflowRoutes.post("/workspaces/:workspaceId/runs/meeting-action-items", asyncHandler(meetingActionItems));
workflowRoutes.post("/workspaces/:workspaceId/runs/research-brief", asyncHandler(researchBrief));
