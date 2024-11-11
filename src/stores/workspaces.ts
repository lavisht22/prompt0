import { create } from "zustand";
import { Database } from "../../supabase/functions/types";

type Workspace = Database["public"]["Tables"]["workspaces"]["Row"];

interface WorkspacesState {
  workspacesLoading: boolean;
  setWorkspacesLoading: (loading: boolean) => void;
  workspaces: Workspace[];
  setWorkspaces: (workspaces: Workspace[]) => void;
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (workspace: Workspace) => void;
}

const useWorkspacesStore = create<WorkspacesState>((set) => ({
  workspacesLoading: true,
  setWorkspacesLoading: (workspacesLoading) => set({ workspacesLoading }),
  workspaces: [],
  setWorkspaces: (workspaces) => set({ workspaces }),
  activeWorkspace: null,
  setActiveWorkspace: (activeWorkspace) => set({ activeWorkspace }),
}));

export default useWorkspacesStore;
