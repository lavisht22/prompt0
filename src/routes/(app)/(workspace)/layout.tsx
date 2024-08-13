import { Outlet, useParams } from "react-router-dom";

import Sidebar from "./components/sidebar";
import { useEffect } from "react";
import useWorkspaceStore from "../../../stores/workspaces";
import supabase from "../../../utils/supabase";
import toast from "react-hot-toast";
import SplashScreen from "../../../components/splash-screen";

export default function WorkspaceLayout() {
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
  const { workspaces, setWorkspaces, activeWorkspace, setActiveWorkspace } =
    useWorkspaceStore();

  useEffect(() => {
    const init = async () => {
      try {
        if (workspaces.length) return;

        if (!workspaceSlug) return;

        const { data, error } = await supabase.from("workspaces").select("*");

        if (error) {
          throw error;
        }

        setWorkspaces(data);

        const activeWorkspace = data.find(
          (workspace) => workspace.slug === workspaceSlug
        );

        if (!activeWorkspace) {
          throw new Error("Workspace not found.");
        }

        setActiveWorkspace(activeWorkspace);
      } catch {
        toast.error("Oops! Something went wrong.");
      }
    };

    init();
  }, []);

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
