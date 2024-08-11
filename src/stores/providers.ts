import { create } from "zustand";
import { Database } from "../../supabase/types";

type Provider = Database["public"]["Tables"]["providers"]["Row"];

interface ProvidersState {
    providers: Provider[];
    setProviders: (providers: Provider[]) => void;
}

const useProvidersStore = create<ProvidersState>((set) => ({
    providers: [],
    setProviders: (providers) => set({ providers }),
}));

export default useProvidersStore;
