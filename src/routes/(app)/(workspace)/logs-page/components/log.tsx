import { Button } from "@nextui-org/react";
import { formatDistanceToNow } from "date-fns";
import { useMemo, useState } from "react";
import { BiCollapseVertical, BiExpandVertical } from "react-icons/bi";
import { Json } from "supabase/functions/types";
import ReactJson from "react-json-view";

export type LogT = {
  id: string;
  versions: {
    prompts: {
      name: string;
    } | null;
  } | null;
  error: Json | null;
  created_at: string;
  request: Json;
  response: Json;
};

export default function Log({ log }: { log: LogT }) {
  const [expanded, setExpanded] = useState(false);

  const display = useMemo(
    () => ({
      id: log.id,
      request: log.request,
      response: log.response,
      error: log.error,
      created_at: log.created_at,
    }),
    [log]
  );

  return (
    <div className="w-full border-b">
      <div
        key={log.id}
        className="w-full flex flex-row justify-between items-center px-4 py-4"
      >
        <div className="flex gap-4 items-center">
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <BiCollapseVertical className="w-4 h-4" />
            ) : (
              <BiExpandVertical className="w-4 h-4" />
            )}
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="block">
                {log.versions?.prompts?.name || "-"}
              </span>
              <div
                className={`w-2 h-2 rounded-full ${
                  log.error ? "bg-danger-500" : "bg-success-500"
                }`}
                title={log.error ? "Error" : "Success"}
              ></div>
            </div>
            <span className="block text-xs text-default-500">{log.id}</span>
          </div>
        </div>
        <span className="block text-xs text-default-500">
          {formatDistanceToNow(new Date(log.created_at))}
        </span>
      </div>
      {expanded && (
        <div className="w-full px-4 py-4 bg-default-50 border-t">
          <ReactJson src={display} />
        </div>
      )}
    </div>
  );
}
