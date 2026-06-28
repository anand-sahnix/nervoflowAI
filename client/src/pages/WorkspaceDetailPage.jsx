import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { FileUp, MessageSquare, Play } from "lucide-react";
import { api } from "../api/client.js";
import { fetchChatThreads, fetchDocuments, fetchRuns, fetchWorkspace, queryKeys } from "../api/queries.js";
import { Button } from "../components/Button.jsx";
import { errorMessage } from "../utils/errors.js";

export function WorkspaceDetailPage() {
  const { workspaceId } = useParams();
  const queryClient = useQueryClient();
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [error, setError] = useState("");

  const { data: workspace, isLoading } = useQuery({
    queryKey: queryKeys.workspace(workspaceId),
    queryFn: () => fetchWorkspace(workspaceId)
  });
  const { data: documents = [] } = useQuery({ queryKey: queryKeys.documents(workspaceId), queryFn: () => fetchDocuments(workspaceId) });
  const { data: runs = [] } = useQuery({ queryKey: queryKeys.runs(workspaceId), queryFn: () => fetchRuns(workspaceId) });
  const { data: threads = [] } = useQuery({ queryKey: queryKeys.chat(workspaceId), queryFn: () => fetchChatThreads(workspaceId) });

  function refreshWorkspace() {
    queryClient.invalidateQueries({ queryKey: queryKeys.workspace(workspaceId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.documents(workspaceId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.runs(workspaceId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.chat(workspaceId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
  }

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post(`/workspaces/${workspaceId}/documents/upload`, formData);
      return data.document;
    },
    onSuccess: () => {
      setFile(null);
      setError("");
      refreshWorkspace();
    },
    onError: (err) => setError(errorMessage(err, "Upload failed"))
  });

  const workflowMutation = useMutation({
    mutationFn: async ({ endpoint, body }) => {
      const { data } = await api.post(`/workspaces/${workspaceId}/runs/${endpoint}`, body);
      return data.run;
    },
    onSuccess: refreshWorkspace,
    onError: (err) => setError(errorMessage(err, "Workflow failed"))
  });

  const chatMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/workspaces/${workspaceId}/chat`, { question });
      return data;
    },
    onSuccess: () => {
      setQuestion("");
      refreshWorkspace();
    },
    onError: (err) => setError(errorMessage(err, "Question failed"))
  });

  if (isLoading) return <p className="text-slate-600">Loading workspace...</p>;

  const readyDocs = documents.filter((doc) => doc.status === "ready");
  const canCompare = selectedDocs.length >= 2;

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="mb-3 h-2 w-20 rounded-full" style={{ backgroundColor: workspace.color }} />
        <h1 className="text-2xl font-bold text-slate-950">{workspace.name}</h1>
        <p className="mt-1 text-slate-600">{workspace.description || "Upload documents and run workflows from this workspace."}</p>
      </section>
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Documents" value={workspace.stats.documentCount} />
        <Metric label="Ready" value={workspace.stats.readyDocumentCount} />
        <Metric label="Runs" value={workspace.stats.runCount} />
      </div>
      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <section className="grid gap-4 lg:grid-cols-2">
        <Panel title="Documents">
          <form className="mb-4 flex flex-col gap-3 sm:flex-row" onSubmit={(event) => { event.preventDefault(); uploadMutation.mutate(); }}>
            <input className="focus-ring h-10 flex-1 rounded-md border border-slate-300 px-3 text-sm" type="file" onChange={(event) => setFile(event.target.files?.[0] || null)} />
            <Button disabled={!file || uploadMutation.isPending}>
              <FileUp className="h-4 w-4" />
              Upload
            </Button>
          </form>
          <div className="space-y-2">
            {documents.map((doc) => (
              <label key={doc.id} className="flex items-start gap-3 rounded-md border border-slate-200 p-3">
                <input
                  className="mt-1"
                  type="checkbox"
                  disabled={doc.status !== "ready"}
                  checked={selectedDocs.includes(doc.id)}
                  onChange={(event) => setSelectedDocs((current) => event.target.checked ? [...current, doc.id] : current.filter((id) => id !== doc.id))}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-slate-900">{doc.originalName}</span>
                  <span className="text-xs uppercase text-slate-500">{doc.status}</span>
                  {doc.processingError && <span className="block text-xs text-red-700">{doc.processingError}</span>}
                </span>
              </label>
            ))}
            {!documents.length && <p className="text-sm text-slate-600">No documents uploaded yet.</p>}
          </div>
        </Panel>
        <Panel title="Workflows">
          <div className="grid gap-2 sm:grid-cols-2">
            <WorkflowButton label="Summarize" disabled={!readyDocs.length} onClick={() => workflowMutation.mutate({ endpoint: "summarize", body: {} })} />
            <WorkflowButton label="Compare" disabled={!canCompare} onClick={() => workflowMutation.mutate({ endpoint: "compare", body: { documentIds: selectedDocs } })} />
            <WorkflowButton label="Action Items" disabled={!readyDocs.length} onClick={() => workflowMutation.mutate({ endpoint: "meeting-action-items", body: { documentIds: selectedDocs } })} />
            <WorkflowButton label="Research Brief" disabled={!readyDocs.length} onClick={() => workflowMutation.mutate({ endpoint: "research-brief", body: {} })} />
          </div>
        </Panel>
        <Panel title="Chat">
          <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); chatMutation.mutate(); }}>
            <textarea className="focus-ring min-h-24 w-full rounded-md border border-slate-300 p-3 text-sm" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask a question about this workspace" />
            <Button disabled={!question.trim() || !readyDocs.length || chatMutation.isPending}>
              <MessageSquare className="h-4 w-4" />
              Ask
            </Button>
          </form>
          <div className="mt-4 space-y-2">
            {threads.slice(0, 4).map((thread) => (
              <p key={thread.id} className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700">{thread.title}</p>
            ))}
          </div>
        </Panel>
        <Panel title="Recent Runs">
          <div className="space-y-2">
            {runs.slice(0, 6).map((run) => (
              <Link key={run.id} to={`/runs/${run.id}`} className="block rounded-md border border-slate-200 p-3 hover:bg-slate-50">
                <span className="block font-medium text-slate-900">{run.title || run.type}</span>
                <span className="text-xs uppercase text-slate-500">{run.status}</span>
              </Link>
            ))}
            {!runs.length && <p className="text-sm text-slate-600">No workflow runs yet.</p>}
          </div>
        </Panel>
      </section>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-600">{label}</p>
      <p className="text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="mb-3 font-bold text-slate-950">{title}</h2>
      {children}
    </section>
  );
}

function WorkflowButton({ label, disabled, onClick }) {
  return (
    <Button className="justify-start" variant="secondary" disabled={disabled} onClick={onClick}>
      <Play className="h-4 w-4" />
      {label}
    </Button>
  );
}
