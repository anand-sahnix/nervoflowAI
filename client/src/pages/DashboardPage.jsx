import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, FileText, PanelsTopLeft, Workflow } from "lucide-react";
import { fetchDashboard, queryKeys } from "../api/queries.js";

export function DashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: queryKeys.dashboard, queryFn: fetchDashboard });

  if (isLoading) return <p className="text-slate-600">Loading dashboard...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Dashboard</h1>
        <p className="text-slate-600">Workspace activity and recent document intelligence runs.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat icon={PanelsTopLeft} label="Workspaces" value={data?.stats.workspaceCount || 0} />
        <Stat icon={FileText} label="Documents" value={data?.stats.documentCount || 0} />
        <Stat icon={Workflow} label="Runs" value={data?.stats.runCount || 0} />
      </div>
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold text-slate-950">Recent Workspaces</h2>
            <Link className="text-sm font-semibold text-emerald-700" to="/workspaces">View all</Link>
          </div>
          <div className="space-y-2">
            {(data?.workspaces || []).map((workspace) => (
              <Link key={workspace.id} to={`/workspaces/${workspace.id}`} className="flex items-center justify-between rounded-md border border-slate-200 p-3 hover:bg-slate-50">
                <span className="font-medium text-slate-900">{workspace.name}</span>
                <ArrowRight className="h-4 w-4 text-slate-500" />
              </Link>
            ))}
            {!data?.workspaces?.length && <p className="text-sm text-slate-600">No workspaces yet.</p>}
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 font-bold text-slate-950">Recent Runs</h2>
          <div className="space-y-2">
            {(data?.recentRuns || []).map((run) => (
              <Link key={run.id} to={`/runs/${run.id}`} className="block rounded-md border border-slate-200 p-3 hover:bg-slate-50">
                <p className="font-medium text-slate-900">{run.title || run.type}</p>
                <p className="text-sm text-slate-600">{run.status}</p>
              </Link>
            ))}
            {!data?.recentRuns?.length && <p className="text-sm text-slate-600">No runs yet.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <Icon className="mb-3 h-5 w-5 text-emerald-700" />
      <p className="text-sm text-slate-600">{label}</p>
      <p className="text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}
