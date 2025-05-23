import { create } from "zustand";

export type Prompt = {
    id: string;
    name: string;
    user_id: string;
    updated_at: string;
    project_id: string | null;
    number: number;
};

interface PromptsState {
    prompts: Prompt[];
    setPrompts: (prompts: Prompt[]) => void;
}

const usePromptsStore = create<PromptsState>((set) => ({
    prompts: [],
    setPrompts: (prompts) => set({ prompts }),
}));

export default usePromptsStore;
