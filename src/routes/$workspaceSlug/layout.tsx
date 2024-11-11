import { Outlet, useParams } from "react-router-dom";

import Sidebar from "./components/sidebar";
import { useEffect } from "react";

import toast from "react-hot-toast";
import SplashScreen from "components/splash-screen";
import useWorkspacesStore from "stores/workspaces";

export default function WorkspaceLayout() {
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>();

  const { workspaces, activeWorkspace, setActiveWorkspace } =
    useWorkspacesStore();

  useEffect(() => {
    try {
      if (workspaces.length === 0) return;

      if (!workspaceSlug) return;

      const activeWorkspace = workspaces.find(
        (workspace) => workspace.slug === workspaceSlug
      );

      if (!activeWorkspace) {
        throw new Error("Workspace not found.");
      }

      setActiveWorkspace(activeWorkspace);
    } catch {
      toast.error("Oops! Something went wrong.");
    }
  }, [setActiveWorkspace, workspaceSlug, workspaces]);

  if (!activeWorkspace) {
    return <SplashScreen loading />;
  }

  return (
    <div className="flex w-screen h-screen bg-default-100">
      <Sidebar />
      <div className="flex-1 p-2">
        <div className="bg-background h-full rounded-md overflow-hidden shadow-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
