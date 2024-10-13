import { Button, Card, CardBody, Chip, Textarea } from "@nextui-org/react";
import { LuCornerUpLeft } from "react-icons/lu";
import { useTheme } from "next-themes";
import { z } from "zod";
import { AssistantMessageSchema } from "./assistant-message";
import ToolResponse from "./tool-response";
import { Editor } from "@monaco-editor/react";

export default function Response({
  type,
  value,
  onAddToConversation,
}: {
  value: z.infer<typeof AssistantMessageSchema>;
  type: string;
  onAddToConversation: () => void;
}) {
  const { theme } = useTheme();

  return (
    <>
      <Card>
        <CardBody className="gap-4">
          <Chip size="sm" variant="flat" color="secondary">
            RESPONSE
          </Chip>

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
                  maxRows={100000}
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
        </CardBody>
      </Card>
      <div>
        {((value.content && value.content.length > 0) ||
          (value.tool_calls && value.tool_calls.length > 0)) && (
          <Button
            size="sm"
            variant="flat"
            startContent={<LuCornerUpLeft />}
            onPress={onAddToConversation}
          >
            Add to conversation
          </Button>
        )}
      </div>
    </>
  );
}
