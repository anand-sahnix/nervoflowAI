import { createBrowserRouter, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import { AuthPage } from "./pages/AuthPage.jsx";
import { DashboardPage } from "./pages/DashboardPage.jsx";
import { WorkspacesPage } from "./pages/WorkspacesPage.jsx";
import { WorkspaceDetailPage } from "./pages/WorkspaceDetailPage.jsx";
import { RunDetailPage } from "./pages/RunDetailPage.jsx";

export const router = createBrowserRouter([
  { path: "/login", element: <AuthPage mode="login" /> },
  { path: "/register", element: <AuthPage mode="register" /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: "/", element: <DashboardPage /> },
          { path: "/workspaces", element: <WorkspacesPage /> },
          { path: "/workspaces/:workspaceId", element: <WorkspaceDetailPage /> },
          { path: "/runs/:runId", element: <RunDetailPage /> }
        ]
      }
    ]
  },
  { path: "*", element: <Navigate to="/" replace /> }
]);
