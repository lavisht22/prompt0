import { Textarea } from "@nextui-org/react";

import { useTheme } from "next-themes";
import { z } from "zod";
import { AssistantMessageSchema } from "./assistant-message";
import ToolResponse from "./tool-response";
import { Editor } from "@monaco-editor/react";

export default function Response({
  type,
  value,
  maxRows = 100000,
}: {
  value: z.infer<typeof AssistantMessageSchema>;
  type: string;
  maxRows?: number;
}) {
  const { theme } = useTheme();

  return (
    <>
      {!value.content && !value.tool_calls && (
        <p className="text-sm text-default-500">
          Run prompt to see assistant response
        </p>
      )}

      {value.content && (
        <>
          {type === "json_object" && (
            <Editor
              theme={theme}
              height="300px"
              defaultLanguage="json"
              value={value.content}
              options={{
                minimap: { enabled: false },
                lineNumbers: "off",
                wordWrap: "on",
              }}
            />
          )}

          {type === "text" && (
            <Textarea
              variant="bordered"
              readOnly
              minRows={1}
              maxRows={maxRows}
              value={value.content}
            />
          )}
        </>
      )}

      {value.tool_calls && value.tool_calls.length > 0 && (
        <>
          {value.tool_calls.map((toolCall) => (
            <ToolResponse key={toolCall.id} value={toolCall} />
          ))}
        </>
      )}
    </>
  );
}
