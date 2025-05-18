import { Outlet, useParams } from "react-router-dom";

import Sidebar from "./components/sidebar";
import { useEffect } from "react";

import toast from "react-hot-toast";
import SplashScreen from "components/splash-screen";
import useWorkspacesStore from "stores/workspaces";
import { useAuth } from "contexts/auth-context";
import supabase from "utils/supabase";
import useProjectsStore from "stores/projects";

export default function WorkspaceLayout() {
  const { user, updateUserMetadata } = useAuth();
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>();

  const { workspaces, activeWorkspace, setActiveWorkspace, setWorkspaceUsers } =
    useWorkspacesStore();
  const { setProjects } = useProjectsStore();

  useEffect(() => {
    try {
      if (!user || workspaces.length === 0) return;

      if (!workspaceSlug) return;

      const activeWorkspace = workspaces.find(
        (workspace) => workspace.slug === workspaceSlug
      );

      if (!activeWorkspace) {
        throw new Error("Workspace not found.");
      }

      setActiveWorkspace(activeWorkspace);
      if (user.user_metadata.last_workspace !== activeWorkspace.slug) {
        updateUserMetadata({ last_workspace: activeWorkspace.slug });
      }
    } catch {
      toast.error("Oops! Something went wrong.");
    }
  }, [setActiveWorkspace, updateUserMetadata, user, workspaceSlug, workspaces]);

  useEffect(() => {
    const loadProjects = async () => {
      if (!activeWorkspace) return;

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("workspace_id", activeWorkspace.id);

      if (error) {
        throw error;
      }
      <s></s>;

      setProjects(data);
    };

    loadProjects();
  }, [activeWorkspace, setProjects]);

  useEffect(() => {
    const loadWorkspaceUsers = async () => {
      if (!activeWorkspace) return;

      const { data, error } = await supabase.rpc("get_users_in_workspace", {
        workspace_id: activeWorkspace.id,
      });

      if (error) {
        throw error;
      }

      setWorkspaceUsers(data);
    };

    loadWorkspaceUsers();
  }, [activeWorkspace, setWorkspaceUsers]);

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
