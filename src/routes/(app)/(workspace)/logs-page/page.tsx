import { useCallback, useEffect, useState } from "react";
import supabase from "utils/supabase";
import toast from "react-hot-toast";
import EmptyList from "components/empty-list";
import { Button } from "@nextui-org/react";
import Log, { LogT } from "./component/log";
import { LuRefreshCw } from "react-icons/lu";

export default function LogsPage() {
  const [loading, setLoading] = useState(true);
  const [moreAvailable, setMoreAvailable] = useState(true);
  const [logs, setLogs] = useState<LogT[]>([]);

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("logs")
        .select(
          "id, error, created_at, request, response, versions(prompts(name))"
        )
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        throw error;
      }

      setLogs(data);
    } catch {
      toast.error("Oops! Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMoreLogs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("logs")
        .select(
          "id, error, created_at, request, response, versions(prompts(name))"
        )
        .lt("created_at", logs[logs.length - 1].created_at)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        throw error;
      }

      setLogs((prevLogs) => [...prevLogs, ...data]);
      setMoreAvailable(data.length === 100);
    } catch {
      toast.error("Oops! Something went wrong.");
    }
  }, [logs]);

  useEffect(() => {
    loadLogs();
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
          <div className="flex justify-between items-center p-4 border-b">
            <div />
            <Button
              size="sm"
              startContent={<LuRefreshCw />}
              isLoading={loading}
              onPress={loadLogs}
            >
              Reload
            </Button>
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
                onClick={loadMoreLogs}
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
