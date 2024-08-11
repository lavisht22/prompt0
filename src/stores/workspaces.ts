import { create } from "zustand";
import { Database } from "../../supabase/types";

type Workspace = Database["public"]["Tables"]["workspaces"]["Row"];

interface WorkspacesState {
    workspaces: Workspace[];
    setWorkspaces: (workspaces: Workspace[]) => void;
    activeWorkspace: Workspace | null;
    setActiveWorkspace: (workspace: Workspace) => void;
}

const useWorkspacesStore = create<WorkspacesState>((set) => ({
    workspaces: [],
    setWorkspaces: (workspaces) => set({ workspaces }),
    activeWorkspace: null,
    setActiveWorkspace: (activeWorkspace) => set({ activeWorkspace }),
}));

export default useWorkspacesStore;
