import { Outlet, useNavigate } from "react-router-dom";
import AppProviders from "./providers";
import supabase from "utils/supabase";
import { useEffect } from "react";
import useWorkspacesStore from "stores/workspaces";
import toast from "react-hot-toast";
import { useAuth } from "contexts/auth-context";

export default function AppLayout() {
  const navigate = useNavigate();

  const { user, userLoading } = useAuth();
  const { setWorkspaces, setWorkspacesLoading } = useWorkspacesStore();

  useEffect(() => {
    const init = async () => {
      if (userLoading) return;

      if (!user) {
        setWorkspaces([]);
        setWorkspacesLoading(false);
        navigate("/login");
        return;
      }

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
  }, [navigate, setWorkspaces, setWorkspacesLoading, user, userLoading]);

  return (
    <AppProviders>
      <Outlet />
    </AppProviders>
  );
}
