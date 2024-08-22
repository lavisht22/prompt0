import { Button, Textarea } from "@nextui-org/react";
import { LuTrash2 } from "react-icons/lu";
import { z } from "zod";

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
}: {
  value: AssistantMessage;
  onValueChange: (value: AssistantMessage) => void;
  isInvalid?: boolean;
  onRemove: () => void;
}) {
  return (
    <div className="p-3 flex flex-col border-b gap-2">
      <div className="flex justify-between items-center">
        <div className="bg-green-100 px-3 py-1 text-xs font-bold rounded-xl">
          <h4>ASSISTANT</h4>
        </div>

        <div className="flex items-center">
          <Button
            variant="light"
            size="sm"
            isIconOnly
            radius="full"
            onPaste={onRemove}
          >
            <LuTrash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <Textarea
        aria-label="Assistant message"
        placeholder="Enter assistant message..."
        value={value.content}
        onValueChange={(newValue) =>
          onValueChange({
            ...value,
            content: newValue,
          })
        }
        isInvalid={isInvalid}
        minRows={1}
        maxRows={100000}
      />
    </div>
  );
}
