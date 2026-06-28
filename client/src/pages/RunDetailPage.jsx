import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { fetchRun, queryKeys } from "../api/queries.js";

export function RunDetailPage() {
  const { runId } = useParams();
  const { data: run, isLoading } = useQuery({ queryKey: queryKeys.run(runId), queryFn: () => fetchRun(runId) });

  if (isLoading) return <p className="text-slate-600">Loading run...</p>;

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <p className="text-sm uppercase text-slate-500">{run.status}</p>
        <h1 className="text-2xl font-bold text-slate-950">{run.title || run.type}</h1>
      </section>
      <JsonPanel title="Input" value={run.input} />
      <JsonPanel title="Output" value={run.output} />
      <JsonPanel title="Citations" value={run.citations} />
      <JsonPanel title="Evaluation" value={run.evaluation} />
      <JsonPanel title="Trace" value={run.trace} />
    </div>
  );
}

function JsonPanel({ title, value }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="mb-3 font-bold text-slate-950">{title}</h2>
      <pre className="max-h-96 overflow-auto rounded-md bg-slate-950 p-4 text-xs leading-6 text-slate-100">
        {JSON.stringify(value, null, 2)}
      </pre>
    </section>
  );
}
