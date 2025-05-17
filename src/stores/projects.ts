import { create } from "zustand";

export type Project = {
    id: string;
    name: string;
    description: string;
    created_at: string;
};

interface ProjectsState {
    projects: Project[];
    setProjects: (projects: Project[]) => void;
}

const useProjectsStore = create<ProjectsState>((set) => ({
    projects: [],
    setProjects: (projects) => set({ projects }),
}));

export default useProjectsStore;
