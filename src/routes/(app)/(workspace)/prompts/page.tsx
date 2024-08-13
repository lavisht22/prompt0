import { Button, Card, CardBody, Input } from "@nextui-org/react";
import { useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import { LuPlus, LuSearch } from "react-icons/lu";
import usePromptsStore from "stores/prompts";
import useWorkspacesStore from "stores/workspaces";
import supabase from "utils/supabase";

export default function PromptsPage() {
  const { activeWorkspace } = useWorkspacesStore();
  const { prompts, setPrompts } = usePromptsStore();

  const load = useCallback(async () => {
    try {
      if (!activeWorkspace) {
        return;
      }

      const { data, error } = await supabase
        .from("prompts")
        .select("id, name, user_id, updated_at")
        .eq("workspace_id", activeWorkspace.id)
        .order("updated_at", { ascending: false });

      if (error) {
        throw error;
      }

      setPrompts(data);
    } catch {
      toast.error("Oops! Something went wrong.");
    }
  }, [activeWorkspace, setPrompts]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="h-full">
      <div className="flex justify-between items-center bg-background px-6 h-12 border-b">
        <div className="flex items-center space-x-2">
          <h2 className="font-medium">Prompts</h2>
        </div>

        <Button
          size="sm"
          color="primary"
          startContent={<LuPlus />}
          // onPress={add}
        >
          Create
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

        {prompts.map((prompt) => (
          <Card
            isHoverable
            key={prompt.id}
            radius="none"
            className="w-full shadow-none"
            // onPress={() => setActiveProvider(provider)}
            isPressable
          >
            <CardBody className="flex flex-row justify-between items-center px-6 py-4">
              <div className="flex items-center space-x-3">
                <h4>{prompt.name}</h4>
              </div>
              <div>
                <span className="block text-sm text-default-500">Aug 10</span>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
