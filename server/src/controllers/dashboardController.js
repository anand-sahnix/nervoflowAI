import { repository } from "../data/repository.js";

export async function getDashboard(req, res) {
  const userId = req.user.id;
  const [workspaceCount, documentCount, runCount, recentRuns, workspaces] = await Promise.all([
    repository.count("workspaces", { userId }),
    repository.count("documents", { userId }),
    repository.count("workflow_runs", { userId }),
    repository.getAll("workflow_runs", { userId }, { createdAt: -1 }),
    repository.getAll("workspaces", { userId }, { createdAt: -1 })
  ]);

  res.json({
    stats: { workspaceCount, documentCount, runCount },
    recentRuns: recentRuns.slice(0, 5),
    workspaces: workspaces.slice(0, 5)
  });
}
