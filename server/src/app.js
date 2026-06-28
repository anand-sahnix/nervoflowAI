import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { repository } from "./data/repository.js";
import { requireAuth } from "./middleware/authMiddleware.js";
import { errorMiddleware, notFound } from "./middleware/errorMiddleware.js";
import { authRoutes } from "./routes/authRoutes.js";
import { workspaceRoutes } from "./routes/workspaceRoutes.js";
import { dashboardRoutes } from "./routes/dashboardRoutes.js";
import { documentRoutes } from "./routes/documentRoutes.js";
import { workflowRoutes } from "./routes/workflowRoutes.js";
import { chatRoutes } from "./routes/chatRoutes.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.clientUrl, credentials: true }));
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (req, res) => {
    res.json({ ok: true, repository: repository.mode, time: new Date().toISOString() });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/workspaces", requireAuth, workspaceRoutes);
  app.use("/api/dashboard", requireAuth, dashboardRoutes);
  app.use("/api", requireAuth, documentRoutes);
  app.use("/api", requireAuth, workflowRoutes);
  app.use("/api", requireAuth, chatRoutes);

  app.use(notFound);
  app.use(errorMiddleware);

  return app;
}
