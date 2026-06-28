import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { api } from "../api/client.js";
import { fetchWorkspaces, queryKeys } from "../api/queries.js";
import { Button } from "../components/Button.jsx";
import { errorMessage } from "../utils/errors.js";

export function WorkspacesPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const { data: workspaces = [], isLoading } = useQuery({ queryKey: queryKeys.workspaces, queryFn: fetchWorkspaces });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/workspaces", { name });
      return data.workspace;
    },
    onSuccess: () => {
      setName("");
      setError("");
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    onError: (err) => setError(errorMessage(err, "Could not create workspace"))
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Workspaces</h1>
        <p className="text-slate-600">Create a document workspace and start uploading knowledge.</p>
      </div>
      <form
        className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          createMutation.mutate();
        }}
      >
        <input
          className="focus-ring h-10 flex-1 rounded-md border border-slate-300 px-3"
          placeholder="Workspace name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <Button disabled={!name.trim() || createMutation.isPending}>
          <Plus className="h-4 w-4" />
          Create
        </Button>
      </form>
      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {isLoading ? (
        <p className="text-slate-600">Loading workspaces...</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {workspaces.map((workspace) => (
            <Link key={workspace.id} to={`/workspaces/${workspace.id}`} className="rounded-lg border border-slate-200 bg-white p-4 hover:border-emerald-300 hover:bg-emerald-50/30">
              <div className="mb-3 h-2 w-16 rounded-full" style={{ backgroundColor: workspace.color }} />
              <h2 className="font-bold text-slate-950">{workspace.name}</h2>
              <p className="mt-1 text-sm text-slate-600">{workspace.description || "No description yet."}</p>
            </Link>
          ))}
          {!workspaces.length && <p className="text-sm text-slate-600">No workspaces yet.</p>}
        </div>
      )}
    </div>
  );
}
