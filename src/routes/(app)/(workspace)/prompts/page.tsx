import { Button, Input } from "@nextui-org/react";
import { useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import { LuPlus, LuSearch } from "react-icons/lu";
import { Link, useNavigate } from "react-router-dom";
import usePromptsStore from "stores/prompts";
import useWorkspacesStore from "stores/workspaces";
import supabase from "utils/supabase";
import EmptyList from "components/empty-list";

export default function PromptsPage() {
  const { activeWorkspace } = useWorkspacesStore();
  const { prompts, setPrompts } = usePromptsStore();
  const navigate = useNavigate();

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

  const create = useCallback(() => {
    navigate("create");
  }, [navigate]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center bg-background px-3 h-12 border-b">
        <div className="flex items-center space-x-2">
          <h2 className="font-medium">Prompts</h2>
        </div>

        <Button
          size="sm"
          color="primary"
          startContent={<LuPlus />}
          onPress={create}
        >
          Create
        </Button>
      </div>
      {prompts.length === 0 ? (
        <EmptyList
          title="No prompts yet"
          description="Once you create a prompt, it will appear here."
          buttonText="Create Prompt"
          onButtonClick={create}
        />
      ) : (
        <div className="flex flex-col h-full overflow-y-auto">
          <Input
            variant="flat"
            className="bg-background"
            classNames={{
              inputWrapper: "bg-background border-b p4-6",
            }}
            radius="none"
            aria-label="Search"
            startContent={<LuSearch />}
            placeholder="Search"
          />

          {prompts.map((prompt) => (
            <Link
              key={prompt.id}
              to={`/${activeWorkspace?.slug}/prompts/${prompt.id}`}
              className="w-full flex flex-row justify-between items-center px-4 py-4 cursor-default hover:bg-default-100"
            >
              <div className="flex items-center space-x-3">
                <h4 className="text-sm">{prompt.name}</h4>
              </div>
              <div>
                <span className="block text-xs text-default-500">Aug 10</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
