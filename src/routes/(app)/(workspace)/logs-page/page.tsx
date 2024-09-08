import { useCallback, useEffect, useState } from "react";
import supabase from "utils/supabase";
import toast from "react-hot-toast";
import EmptyList from "components/empty-list";
import { Json } from "supabase/functions/types";
import { Button } from "@nextui-org/react";
import { formatDistanceToNow } from "date-fns";

type Log = {
  id: string;
  versions: {
    prompts: {
      name: string;
    } | null;
  } | null;
  error: Json | null;
  created_at: string;
};

export default function LogsPage() {
  const [loading, setLoading] = useState(true);
  const [moreAvailable, setMoreAvailable] = useState(true);
  const [logs, setLogs] = useState<Log[]>([]);

  const loadLogs = useCallback(async (skip: number) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("logs")
        .select("id, error, created_at, versions(prompts(name))")
        .order("created_at", { ascending: false })
        .range(skip, skip + 29);

      if (error) {
        throw error;
      }

      setLogs((prev) => [...prev, ...data]);

      if (data.length < 30) {
        setMoreAvailable(false);
      }
    } catch {
      toast.error("Oops! Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    loadLogs(logs.length);
  }, [loadLogs, logs.length]);

  useEffect(() => {
    loadLogs(0);
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
          {logs.map((log) => (
            <div
              key={log.id}
              className="w-full flex flex-row justify-between items-center px-4 py-4 cursor-default hover:bg-default-100"
            >
              <div className="flex gap-4 items-center">
                {log.error ? (
                  <div className="w-2 h-2 bg-danger-500 rounded-full shadow-md" />
                ) : (
                  <div className="w-2 h-2 bg-success-500 rounded-full shadow-md" />
                )}
                <div>
                  <span className="block">
                    {log.versions?.prompts?.name || "-"}
                  </span>
                  <span className="block text-xs text-default-500">
                    {log.id}
                  </span>
                </div>
              </div>
              <span className="block text-xs text-default-500">
                {formatDistanceToNow(log.created_at)}
              </span>
            </div>
          ))}
          {logs.length > 0 && moreAvailable && (
            <div className="flex justify-center items-center py-4">
              <Button size="sm" isLoading={loading} onClick={loadMore}>
                Load More
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
