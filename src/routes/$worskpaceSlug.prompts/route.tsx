import {
  Button,
  Input,
  Autocomplete,
  AutocompleteItem,
} from "@nextui-org/react";
import { useCallback, useEffect, useState, useMemo, Key } from "react";
import toast from "react-hot-toast";
import { LuPlus, LuSearch, LuBox } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import usePromptsStore from "stores/prompts";
import useProjectsStore from "stores/projects";
import useWorkspacesStore from "stores/workspaces";
import supabase from "utils/supabase";
import EmptyList from "components/empty-list";
import ProjectSelector from "components/project-selector";

export default function PromptsPage() {
  const { activeWorkspace } = useWorkspacesStore();
  const { prompts, setPrompts } = usePromptsStore();
  const { projects } = useProjectsStore();
  const navigate = useNavigate();
  const [projectFilter, setProjectFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const load = useCallback(async () => {
    try {
      if (!activeWorkspace) {
        return;
      }

      const { data, error } = await supabase
        .from("prompts")
        .select("id, name, user_id, updated_at, project_id")
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

  const filteredPrompts = useMemo(() => {
    let tempPrompts = prompts;

    if (projectFilter) {
      tempPrompts = tempPrompts.filter(
        (prompt) => prompt.project_id === projectFilter
      );
    }

    if (searchQuery) {
      tempPrompts = tempPrompts.filter((prompt) =>
        prompt.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return tempPrompts;
  }, [prompts, projectFilter, searchQuery]);

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
          <div className="flex justify-between items-center gap-4 p-4 sticky top-0 bg-background z-50 border-b">
            <Input
              className="max-w-sm"
              variant="bordered"
              size="sm"
              aria-label="Search"
              startContent={<LuSearch />}
              placeholder="Search"
              value={searchQuery}
              onValueChange={setSearchQuery}
            />

            <Autocomplete
              size="sm"
              startContent={<LuBox className="size-5" />}
              aria-label="Project"
              variant="bordered"
              defaultItems={projects}
              placeholder="All Projects"
              className="max-w-48 bg-background"
              selectedKey={projectFilter}
              onSelectionChange={(key: Key | null) =>
                setProjectFilter(key as string | null)
              }
            >
              {(item) => (
                <AutocompleteItem
                  key={item.id}
                  startContent={<LuBox className="text-default-500 size-4" />}
                >
                  {item.name}
                </AutocompleteItem>
              )}
            </Autocomplete>
          </div>

          {filteredPrompts.map((prompt) => (
            <div
              key={prompt.id}
              className="w-full flex flex-row justify-between items-center px-4 py-4 cursor-default hover:bg-default-100"
              onClick={() =>
                navigate(`/${activeWorkspace?.slug}/prompts/${prompt.id}`)
              }
            >
              <div className="flex flex-col gap-2">
                <h4 className="text-sm">{prompt.name}</h4>
              </div>
              <div>
                <ProjectSelector
                  promptId={prompt.id}
                  value={prompt.project_id}
                  onValueChange={(projectId) => {
                    setPrompts(
                      prompts.map((p) =>
                        p.id === prompt.id ? { ...p, project_id: projectId } : p
                      )
                    );
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
