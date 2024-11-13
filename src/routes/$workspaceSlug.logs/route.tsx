import { Key, useCallback, useEffect, useState, useRef } from "react";
import supabase from "utils/supabase";
import toast from "react-hot-toast";
import EmptyList from "components/empty-list";
import { Button, Autocomplete, AutocompleteItem } from "@nextui-org/react";
import Log, { LogT } from "./component/log";
import { LuCircleDot, LuMessageCircle, LuRefreshCw } from "react-icons/lu";
import useWorkspacesStore from "stores/workspaces";

export default function LogsPage() {
  const { activeWorkspace } = useWorkspacesStore();

  const [loading, setLoading] = useState(true);
  const [moreAvailable, setMoreAvailable] = useState(true);
  const [logs, setLogs] = useState<LogT[]>([]);
  const [prompts, setPrompts] = useState<{ name: string; id: string }[]>([]);

  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [promptFilter, setPromptFilter] = useState<string | null>(null);

  const lastLogCreatedAt = useRef<string | null>(null);

  const loadLogs = useCallback(
    async (more = false) => {
      try {
        setLoading(true);

        const query = supabase
          .from("logs")
          .select(
            "id, error, created_at, request, response, versions!inner(prompt_id, prompts(name))"
          )
          .order("created_at", { ascending: false })
          .limit(100);

        if (more) {
          query.lt("created_at", lastLogCreatedAt.current);
        }

        if (statusFilter !== null) {
          if (statusFilter === "Error") {
            query.not("error", "is", null);
          } else {
            query.is("error", null);
          }
        }

        if (promptFilter !== null) {
          query.eq("versions.prompt_id", promptFilter);
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        if (more) {
          setLogs((prevLogs) => [...prevLogs, ...data]);
        } else {
          setLogs(data);
        }

        lastLogCreatedAt.current = data[data.length - 1].created_at;
        setMoreAvailable(data.length === 100);
      } catch {
        toast.error("Oops! Something went wrong.");
      } finally {
        setLoading(false);
      }
    },
    [promptFilter, statusFilter]
  );

  const loadPrompts = useCallback(async () => {
    try {
      if (!activeWorkspace) return;

      const { data, error } = await supabase
        .from("prompts")
        .select("name, id")
        .eq("workspace_id", activeWorkspace.id);

      if (error) throw error;

      setPrompts(data);
    } catch {
      toast.error("Oops! Something went wrong.");
    }
  }, [activeWorkspace]);

  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);

  useEffect(() => {
    loadLogs(false);
  }, [loadLogs]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center bg-background px-3 h-12 border-b">
        <div className="flex items-center space-x-2">
          <h2 className="font-medium">Logs</h2>
        </div>
      </div>

      {logs.length === 0 ? (
        <EmptyList
          loading={loading}
          title="No logs yet"
          description="Start using your prompts to see logs here"
        />
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-background z-10">
            <div className="flex items-center space-x-2">
              <Autocomplete
                size="sm"
                startContent={<LuMessageCircle className="size-5" />}
                aria-label="Prompt"
                variant="bordered"
                defaultItems={prompts}
                placeholder="Prompt"
                className="max-w-xs"
                selectedKey={promptFilter}
                onSelectionChange={(key: Key | null) =>
                  setPromptFilter(key as string | null)
                }
              >
                {(item) => (
                  <AutocompleteItem key={item.id}>{item.name}</AutocompleteItem>
                )}
              </Autocomplete>
              <Autocomplete
                size="sm"
                startContent={<LuCircleDot className="size-5 " />}
                aria-label="Status"
                variant="bordered"
                placeholder="Status"
                className="max-w-40"
                selectedKey={statusFilter}
                defaultItems={[
                  { id: "Success", name: "Success" },
                  { id: "Error", name: "Error" },
                ]}
                onSelectionChange={(key: Key | null) =>
                  setStatusFilter(key as string | null)
                }
              >
                {(item) => (
                  <AutocompleteItem
                    key={item.id}
                    startContent={
                      <div
                        className={`w-2 h-2 rounded-full ${
                          item.id === "Success"
                            ? "bg-success-500"
                            : "bg-danger-500"
                        }`}
                      />
                    }
                  >
                    {item.name}
                  </AutocompleteItem>
                )}
              </Autocomplete>
            </div>
            <Button
              size="sm"
              startContent={
                <LuRefreshCw className={loading ? "animate-spin" : ""} />
              }
              isDisabled={loading}
              onPress={() => loadLogs(false)}
              isIconOnly
              aria-label="Reload"
            />
          </div>
          {logs.map((log) => (
            <Log key={log.id} log={log} />
          ))}
          {logs.length > 0 && moreAvailable && (
            <div className="flex justify-center items-center p-4">
              <Button
                variant="light"
                fullWidth
                isLoading={loading}
                onPress={() => loadLogs(true)}
              >
                Showing {logs.length} entries. Click to load more.
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
