import { Key, useCallback, useEffect, useState, useRef, useMemo } from "react";
import supabase from "utils/supabase";
import toast from "react-hot-toast";
import EmptyList from "components/empty-list";
import { Button, Autocomplete, AutocompleteItem } from "@heroui/react";
import Log, { LogT } from "./component/log";
import { LuCircleDot, LuMessageCircle, LuRefreshCw } from "react-icons/lu";
import useWorkspacesStore from "stores/workspaces";

export default function LogsPage() {
  const { activeWorkspace } = useWorkspacesStore();

  const [loading, setLoading] = useState(true);
  const [moreAvailable, setMoreAvailable] = useState(true);
  const [logs, setLogs] = useState<LogT[]>([]);
  const [versions, setVersions] = useState<
    { id: string; prompts: { name: string; id: string } }[]
  >([]);

  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [promptFilter, setPromptFilter] = useState<string | null>(null);

  const lastLogCreatedAt = useRef<string | null>(null);

  const prompts = useMemo(() => {
    const promptsMap = new Map<string, { name: string; id: string }>();

    versions.forEach((version) => {
      promptsMap.set(version.prompts.id, version.prompts);
    });

    return Array.from(promptsMap.values());
  }, [versions]);

  const filteredLogs = useMemo(() => {
    let allLogs = [...logs];

    if (promptFilter) {
      const allVersionIds = versions.filter(
        (v) => v.prompts.id === promptFilter
      );

      allLogs = allLogs.filter((log) =>
        allVersionIds.some((v) => v.id === log.version_id)
      );
    }

    if (statusFilter !== null) {
      if (statusFilter === "Error") {
        allLogs = allLogs.filter((log) => log.error !== null);
      } else {
        allLogs = allLogs.filter((log) => log.error === null);
      }
    }

    return allLogs;
  }, [logs, versions, promptFilter, statusFilter]);

  const loadLogs = useCallback(
    async (more = false) => {
      try {
        if (!activeWorkspace) return;
        setLoading(true);

        const query = supabase
          .from("logs")
          .select("id, version_id, error, created_at, request, response")
          .eq("workspace_id", activeWorkspace.id)
          .order("created_at", { ascending: false })
          .limit(500);

        if (more) {
          query.lt("created_at", lastLogCreatedAt.current);
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
        setMoreAvailable(data.length === 500);
      } catch {
        toast.error("Oops! Something went wrong.");
      } finally {
        setLoading(false);
      }
    },
    [activeWorkspace]
  );

  const loadVersions = useCallback(async () => {
    try {
      if (!activeWorkspace) return;

      const { data, error } = await supabase
        .from("versions")
        .select("id, prompts!inner(id, name)")
        .eq("prompts.workspace_id", activeWorkspace?.id);

      if (error) throw error;

      setVersions(data);
    } catch {
      toast.error("Oops! Something went wrong.");
    }
  }, [activeWorkspace]);

  useEffect(() => {
    loadVersions();
  }, [loadVersions]);

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
                startContent={<LuCircleDot className="size-5" />}
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
          {filteredLogs.map((log) => {
            const version = versions.find((v) => v.id === log.version_id);

            return (
              <Log key={log.id} log={log} prompt={version?.prompts.name} />
            );
          })}
          {logs.length > 0 && moreAvailable && (
            <div className="flex justify-center items-center p-4">
              <Button
                variant="light"
                fullWidth
                isLoading={loading}
                onPress={() => loadLogs(true)}
              >
                Loaded {logs.length} entries. Click to load more.
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
