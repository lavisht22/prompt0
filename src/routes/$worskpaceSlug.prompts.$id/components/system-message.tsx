import { Button, Card, CardBody, Chip, cn, Textarea } from "@heroui/react";
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
  variableValues,
  openVariablesDialog,
}: {
  value: SystemMessage;
  onValueChange: (value: SystemMessage) => void;
  isInvalid?: boolean;
  variableValues: Map<string, string>;
  openVariablesDialog: () => void;
}) {
  return (
    <Card className={cn(isInvalid && "bg-danger-50")}>
      <CardBody className="gap-4">
        <Chip size="sm" variant="flat" color="default">
          SYSTEM
        </Chip>

        <div>
          <Textarea
            className="mb-2"
            aria-label="System message"
            variant="bordered"
            placeholder="Set a system prompt"
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
            text={value.content}
            variableValues={variableValues}
            openVariablesDialog={openVariablesDialog}
          />
        </div>

        <div className="absolute top-1 right-1">
          <Button variant="light" size="sm" isIconOnly radius="full">
            <LuInfo className="w-4 h-4" />
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
