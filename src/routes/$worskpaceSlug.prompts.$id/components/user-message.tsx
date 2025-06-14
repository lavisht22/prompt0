import {
  Button,
  Card,
  CardBody,
  Chip,
  cn,
  Input,
  Radio,
  RadioGroup,
  Textarea,
} from "@heroui/react";
import { LuImagePlus, LuText, LuTrash2 } from "react-icons/lu";
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
      <CardBody className="gap-0">
        <div>
          <Chip size="sm" variant="flat" color="primary">
            USER
          </Chip>
        </div>

        <div className="mb-4">
          {value.content.map((part, index) => {
            return (
              <div
                key={index}
                className="py-4 border-b-2 flex flex-col gap-2 relative"
              >
                {part.type === "text" && (
                  <>
                    <Textarea
                      aria-label="User message"
                      variant="bordered"
                      placeholder="Enter text"
                      value={part.text}
                      onChange={(e) => {
                        const newContent = [...value.content];
                        newContent[index] = {
                          type: "text",
                          text: e.target.value,
                        };
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
                  </>
                )}
                {part.type === "image_url" && (
                  <>
                    <Input
                      label="URL"
                      value={part.image_url.url}
                      onChange={(e) => {
                        const newContent = [...value.content];
                        newContent[index] = {
                          type: "image_url",
                          image_url: {
                            url: e.target.value,
                            detail: part.image_url.detail,
                          },
                        };
                        onValueChange({
                          ...value,
                          content: newContent,
                        });
                      }}
                    />

                    <RadioGroup
                      className="px-2"
                      size="sm"
                      label="Detail"
                      orientation="horizontal"
                      value={part.image_url.detail}
                      onValueChange={(newValue: string) => {
                        const newContent = [...value.content];
                        newContent[index] = {
                          ...part,
                          image_url: {
                            ...part.image_url,
                            detail: newValue as "auto" | "low" | "high",
                          },
                        };
                        onValueChange({ ...value, content: newContent });
                      }}
                    >
                      <Radio value="auto">Auto</Radio>
                      <Radio value="low">Low</Radio>
                      <Radio value="high">High</Radio>
                    </RadioGroup>
                    <VariablesList
                      text={part.image_url.url}
                      variableValues={variableValues}
                      openVariablesDialog={openVariablesDialog}
                    />
                  </>
                )}
                <div className="flex flex-row justify-end gap-2">
                  {value.content.length > 1 && (
                    <Button
                      variant="light"
                      color="danger"
                      size="sm"
                      startContent={<LuTrash2 className="size-4" />}
                      onPress={() => {
                        const newContent = value.content.filter(
                          (_, i) => i !== index
                        );
                        onValueChange({ ...value, content: newContent });
                      }}
                    >
                      Remove Part
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-row gap-2">
          <Button
            variant="flat"
            size="sm"
            startContent={<LuImagePlus className="size-4" />}
            onPress={() => {
              const newContent = [...value.content];
              newContent.push({
                type: "image_url",
                image_url: { url: "", detail: "auto" },
              });
              onValueChange({
                ...value,
                content: newContent,
              });
            }}
          >
            Add Image Part
          </Button>
          <Button
            variant="flat"
            size="sm"
            startContent={<LuText className="size-4" />}
            onPress={() => {
              const newContent = [...value.content];
              newContent.push({ type: "text", text: "" });
              onValueChange({
                ...value,
                content: newContent,
              });
            }}
          >
            Add Text Part
          </Button>
        </div>

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
