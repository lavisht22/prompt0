import { create } from "zustand";
import { Database } from "../../supabase/functions/types";

type Workspace = Database["public"]["Tables"]["workspaces"]["Row"];
type User = {
  user_id: string;
  role: Database["public"]["Enums"]["workspace_user_roles"];
  name: string;
  email: string;
};

interface WorkspacesState {
  workspacesLoading: boolean;
  setWorkspacesLoading: (loading: boolean) => void;
  workspaces: Workspace[];
  setWorkspaces: (workspaces: Workspace[]) => void;
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (workspace: Workspace) => void;
  workspaceUsers: User[];
  setWorkspaceUsers: (users: User[]) => void;
}

const useWorkspacesStore = create<WorkspacesState>((set) => ({
  workspacesLoading: true,
  setWorkspacesLoading: (workspacesLoading) => set({ workspacesLoading }),
  workspaces: [],
  setWorkspaces: (workspaces) => set({ workspaces }),
  activeWorkspace: null,
  setActiveWorkspace: (activeWorkspace) => set({ activeWorkspace }),
  workspaceUsers: [],
  setWorkspaceUsers: (users) => set({ workspaceUsers: users }),
}));

export default useWorkspacesStore;
