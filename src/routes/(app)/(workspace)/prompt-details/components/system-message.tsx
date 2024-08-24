import { Button, Textarea } from "@nextui-org/react";
import { LuInfo } from "react-icons/lu";
import { z } from "zod";
import VariablesList from "./variables-list";

export const SystemMessageSchema = z.object({
  role: z.literal("system"),
  content: z.string(),
});

type SystemMessage = z.infer<typeof SystemMessageSchema>;

export default function SystemMessage({
  value,
  onValueChange,
  isInvalid,
}: {
  value: SystemMessage;
  onValueChange: (value: SystemMessage) => void;
  isInvalid?: boolean;
}) {
  return (
    <div className="p-3 flex flex-col border-b gap-2">
      <div className="flex justify-between items-center">
        <div className="bg-default-100 px-3 py-1 text-xs font-bold rounded-xl">
          <h4>SYSTEM</h4>
        </div>

        <div className="flex items-center">
          <Button variant="light" size="sm" isIconOnly radius="full">
            <LuInfo className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <Textarea
        aria-label="System Prompt"
        placeholder="Set a system prompt..."
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
      <VariablesList text={value.content} />
    </div>
  );
}
