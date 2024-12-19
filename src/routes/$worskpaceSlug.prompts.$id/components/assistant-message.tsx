import { Button, Card, CardBody, Chip, cn, Textarea } from "@nextui-org/react";
import { LuTrash2 } from "react-icons/lu";
import { z } from "zod";
import VariablesList from "./variables-list";
import ToolResponse from "./tool-response";

export const AssistantMessageSchema = z.object({
  role: z.literal("assistant"),
  content: z.string().optional().nullable(),
  tool_calls: z
    .array(
      z.object({
        index: z.number(),
        id: z.string(),
        type: z.literal("function"),
        function: z.object({
          name: z.string(),
          arguments: z.string(),
        }),
      })
    )
    .optional()
    .nullable(),
});

type AssistantMessage = z.infer<typeof AssistantMessageSchema>;

export default function AssistantMessage({
  value,
  onValueChange,
  isInvalid,
  onRemove,
  variableValues,
  openVariablesDialog,
}: {
  value: AssistantMessage;
  onValueChange: (value: AssistantMessage) => void;
  isInvalid?: boolean;
  onRemove: () => void;
  variableValues: Map<string, string>;
  openVariablesDialog: () => void;
}) {
  return (
    <Card className={cn(isInvalid && "bg-danger-50")}>
      <CardBody className="gap-4">
        <Chip size="sm" variant="flat">
          ASSISTANT
        </Chip>

        {typeof value.content === "string" && (
          <Textarea
            variant="bordered"
            className="mb-2"
            aria-label="Assistant message"
            placeholder="Enter assistant message..."
            minRows={3}
            maxRows={100000}
            value={value.content}
            onChange={(e) =>
              onValueChange({
                ...value,
                content: e.target.value,
              })
            }
          />
        )}

        {value.tool_calls && value.tool_calls.length > 0 && (
          <>
            {value.tool_calls.map((toolCall) => (
              <ToolResponse key={toolCall.id} value={toolCall} />
            ))}
          </>
        )}

        <VariablesList
          text={value.content ?? ""}
          variableValues={variableValues}
          openVariablesDialog={openVariablesDialog}
        />
        <div className="absolute top-1 right-1">
          <Button
            variant="light"
            color="danger"
            size="sm"
            isIconOnly
            radius="full"
            onPress={onRemove}
          >
            <LuTrash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
