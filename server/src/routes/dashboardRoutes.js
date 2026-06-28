import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getDashboard } from "../controllers/dashboardController.js";

export const dashboardRoutes = Router();

dashboardRoutes.get("/", asyncHandler(getDashboard));
