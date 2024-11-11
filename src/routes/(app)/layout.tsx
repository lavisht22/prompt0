import { Outlet } from "react-router-dom";
import AppProviders from "./providers";
import supabase from "utils/supabase";
import { useEffect } from "react";
import useWorkspacesStore from "stores/workspaces";
import toast from "react-hot-toast";

export default function AppLayout() {
  const { setWorkspaces, setWorkspacesLoading } = useWorkspacesStore();

  useEffect(() => {
    const init = async () => {
      try {
        setWorkspacesLoading(true);

        const { data, error } = await supabase.from("workspaces").select("*");

        if (error) {
          throw error;
        }

        setWorkspaces(data);
      } catch {
        toast.error("Oops! Something went wrong.");
      } finally {
        setWorkspacesLoading(false);
      }
    };

    init();
  }, [setWorkspaces, setWorkspacesLoading]);

  return (
    <AppProviders>
      <Outlet />
    </AppProviders>
  );
}
