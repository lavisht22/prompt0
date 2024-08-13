import { useCallback, useEffect } from "react";
import supabase from "utils/supabase";
import useWorkspacesStore from "stores/workspaces";
import useProvidersStore, { Provider } from "stores/providers";
import toast from "react-hot-toast";
import { Button, Card, CardBody, Input } from "@nextui-org/react";
import { LuPlus, LuSearch } from "react-icons/lu";
import ProviderModal from "./components/provider-modal";
import ProviderIcon from "components/provider-icon";

export default function ProvidersPage() {
  const { activeWorkspace } = useWorkspacesStore();
  const { providers, setProviders, setActiveProvider } = useProvidersStore();

  const load = useCallback(async () => {
    try {
      if (!activeWorkspace) {
        return;
      }

      const { data, error } = await supabase
        .from("providers")
        .select("*")
        .eq("workspace_id", activeWorkspace.id)
        .order("updated_at", { ascending: false });

      if (error) {
        throw error;
      }

      setProviders(
        data.map((provider) => ({
          ...provider,
          options: provider.options as Provider["options"],
        }))
      );
    } catch {
      toast.error("Oops! Something went wrong.");
    }
  }, [activeWorkspace, setProviders]);

  useEffect(() => {
    load();
  }, [load]);

  const add = useCallback(async () => {
    setActiveProvider({
      id: "new",
      workspace_id: "",
      type: "openai",
      name: "",
      options: {},
      created_at: "",
      user_id: "",
      updated_at: "",
    });
  }, [setActiveProvider]);

  return (
    <div className="h-full">
      <div className="flex justify-between items-center bg-background px-6 h-12 border-b">
        <div className="flex items-center space-x-2">
          <h2 className="font-medium">Providers</h2>
        </div>
        <Button
          size="sm"
          color="primary"
          startContent={<LuPlus />}
          onPress={add}
        >
          Add
        </Button>
      </div>
      <div className="h-full overflow-y-auto">
        <Input
          variant="flat"
          className="bg-background"
          classNames={{
            inputWrapper: "bg-background border-b px-6",
          }}
          radius="none"
          aria-label="Search"
          startContent={<LuSearch />}
          placeholder="Search"
        />

        {providers.map((provider) => (
          <Card
            isHoverable
            key={provider.id}
            radius="none"
            className="w-full shadow-none"
            onPress={() => setActiveProvider(provider)}
            isPressable
          >
            <CardBody className="flex flex-row justify-between items-center px-6 py-4">
              <div className="flex items-center space-x-3">
                <ProviderIcon type={provider.type} className="w-6 h-6" />
                <h4>{provider.name}</h4>
              </div>
              <div>
                <span className="block text-sm text-default-500">Aug 10</span>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
      <ProviderModal />
    </div>
  );
}
