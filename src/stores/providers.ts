import { create } from "zustand";
import { Database } from "../../supabase/types";

export type Provider = Database["public"]["Tables"]["providers"]["Row"];

interface ProvidersState {
    providers: Provider[];
    setProviders: (providers: Provider[]) => void;
    activeProvider: Provider | null;
    setActiveProvider: (provider: Provider | null) => void;
}

const useProvidersStore = create<ProvidersState>((set) => ({
    providers: [],
    setProviders: (providers) => set({ providers }),
    activeProvider: null,
    setActiveProvider: (activeProvider) => set({ activeProvider }),
}));

export default useProvidersStore;
