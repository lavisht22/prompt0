import { Button, Card, CardBody, Chip, cn, Textarea } from "@nextui-org/react";
import { LuTrash2 } from "react-icons/lu";
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
    <Card className={cn(isInvalid && "bg-danger-50")}>
      <CardBody className="gap-4">
        <Chip size="sm" variant="flat">
          ASSISTANT
        </Chip>

        <Textarea
          variant="bordered"
          className="mb-2"
          aria-label="Assistant message"
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
