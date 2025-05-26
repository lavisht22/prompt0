import { Card, cn, useDisclosure } from "@heroui/react";
import { LuFunctionSquare } from "react-icons/lu";
import { z } from "zod";
import { ToolDialog } from "./tool-dialog";

export const ToolSchema = z.object({
  type: z.literal("function"),
  function: z.object({
    description: z.string().optional(),
    name: z.string().max(64),
    parameters: z.record(z.any()).optional(),
    strict: z.boolean().optional().default(false),
  }),
});

type Tool = z.infer<typeof ToolSchema>;

export default function Tool({
  value,
  onValueChange,
  isInvalid,
  onRemove,
}: {
  value: Tool;
  onValueChange: (value: Tool) => void;
  isInvalid?: boolean;
  onRemove: () => void;
}) {
  const { isOpen, onOpenChange, onOpen } = useDisclosure();

  return (
    <>
      <Card
        className={cn(
          "flex flex-row gap-2 items-center px-3 py-2",
          isInvalid && "bg-danger-100"
        )}
        isPressable
        onPress={onOpen}
      >
        <LuFunctionSquare className="size-4" />
        <p className="text-sm font-medium">{value.function.name}</p>
      </Card>
      <ToolDialog
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        value={value}
        onValueChange={onValueChange}
        onRemove={() => {
          onOpenChange();
          onRemove();
        }}
      />
    </>
  );
}
