import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createWorkspace,
  deleteWorkspace,
  getWorkspace,
  listWorkspaces,
  updateWorkspace
} from "../controllers/workspaceController.js";

export const workspaceRoutes = Router();

workspaceRoutes.get("/", asyncHandler(listWorkspaces));
workspaceRoutes.post("/", asyncHandler(createWorkspace));
workspaceRoutes.get("/:id", asyncHandler(getWorkspace));
workspaceRoutes.patch("/:id", asyncHandler(updateWorkspace));
workspaceRoutes.delete("/:id", asyncHandler(deleteWorkspace));
