import { Button, cn } from "@nextui-org/react";
import { LuTrash2 } from "react-icons/lu";
import ReactTextareaAutosize from "react-textarea-autosize";
import { z } from "zod";
import VariablesList from "./variables-list";

export const AssistantMessageSchema = z.object({
  role: z.literal("assistant"),
  content: z.string().optional(),
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
    <div
      className={cn(
        "relative w-full inline-flex tap-highlight-transparent shadow-sm px-3  rounded-medium flex-col !duration-150  transition-all motion-reduce:transition-none py-2 bg-default-100 hover:bg-default-200 focus-within:!bg-default-100",
        isInvalid &&
          "!bg-danger-50 hover:!bg-danger-50 focus-within:!bg-danger-50"
      )}
    >
      <label htmlFor="system" className="block text-xs font-medium mb-2">
        ASSISTANT
      </label>

      <ReactTextareaAutosize
        className="outline-none w-full text-sm resize-none mb-4 bg-transparent"
        placeholder="Enter assistant message..."
        minRows={1}
        maxRows={100000}
        value={value.content}
        onChange={(e) =>
          onValueChange({
            ...value,
            content: e.target.value,
          })
        }
      />
      <VariablesList
        text={value.content ?? ""}
        variableValues={variableValues}
        openVariablesDialog={openVariablesDialog}
      />
      <div className="absolute top-0 right-0">
        <Button
          variant="light"
          size="sm"
          isIconOnly
          radius="full"
          onPress={onRemove}
        >
          <LuTrash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
