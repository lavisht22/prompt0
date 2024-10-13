import { Button, Card, CardBody, Chip, cn, Textarea } from "@nextui-org/react";
import { LuTrash2 } from "react-icons/lu";
import { z } from "zod";
import VariablesList from "./variables-list";

const TextPartSchema = z.object({
  type: z.literal("text"),
  text: z.string(),
});

const ImagePartSchema = z.object({
  type: z.literal("image_url"),
  image_url: z.object({
    url: z.string(),
    detail: z.enum(["auto", "low", "high"]),
  }),
});

export const UserMessageSchema = z.object({
  role: z.literal("user"),
  content: z.array(z.union([TextPartSchema, ImagePartSchema])),
});

type UserMessage = z.infer<typeof UserMessageSchema>;

export default function UserMessage({
  value,
  onValueChange,
  isInvalid,
  onRemove,
  variableValues,
  openVariablesDialog,
}: {
  value: UserMessage;
  onValueChange: (value: UserMessage) => void;
  isInvalid?: boolean;
  onRemove: () => void;
  variableValues: Map<string, string>;
  openVariablesDialog: () => void;
}) {
  return (
    <Card className={cn(isInvalid && "bg-danger-50")}>
      <CardBody className="gap-4">
        <Chip size="sm" variant="flat" color="primary">
          USER
        </Chip>

        {value.content.map((part, index) => {
          if (part.type === "text") {
            return (
              <div key={index}>
                <Textarea
                  className="mb-2"
                  aria-label="User message"
                  variant="bordered"
                  placeholder="Enter user message..."
                  value={part.text}
                  onChange={(e) => {
                    const newContent = [...value.content];
                    newContent[index] = { type: "text", text: e.target.value };
                    onValueChange({
                      ...value,
                      content: newContent,
                    });
                  }}
                  minRows={3}
                  maxRows={100000}
                />
                <VariablesList
                  text={part.text}
                  variableValues={variableValues}
                  openVariablesDialog={openVariablesDialog}
                />
              </div>
            );
          }

          if (part.type === "image_url") {
            return <div key={index}>Coming soon...</div>;
          }
        })}

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
