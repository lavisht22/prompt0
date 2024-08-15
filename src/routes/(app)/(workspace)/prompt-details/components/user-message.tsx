import { Button, Textarea } from "@nextui-org/react";
import { useState } from "react";
import { LuImage, LuTrash2, LuType } from "react-icons/lu";
import { z } from "zod";

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
}: {
  value: UserMessage;
  onValueChange: (value: UserMessage) => void;
  isInvalid?: boolean;
  onRemove: () => void;
}) {
  const [showControls] = useState(false);

  return (
    <div className="p-3 flex flex-col border-b gap-2">
      <div className="flex justify-between items-center">
        <div className="bg-amber-100 px-3 py-1 text-xs font-bold rounded-xl">
          <h4>USER</h4>
        </div>

        <div className="flex items-center">
          {showControls && (
            <Button variant="light" size="sm" isIconOnly radius="full">
              <LuType className="w-4 h-4" />
            </Button>
          )}
          {showControls && (
            <Button variant="light" size="sm" isIconOnly radius="full">
              <LuImage className="w-4 h-4" />
            </Button>
          )}
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

      {value.content.map((part, index) => {
        if (part.type === "text") {
          return (
            <Textarea
              aria-label="User message"
              placeholder="Enter user message..."
              value={part.text}
              onValueChange={(newValue) => {
                const newContent = [...value.content];
                newContent[index] = { type: "text", text: newValue };
                onValueChange({
                  ...value,
                  content: newContent,
                });
              }}
              isInvalid={isInvalid}
              minRows={3}
              maxRows={100000}
            />
          );
        }

        if (part.type === "image_url") {
          return <div>Coming soon...</div>;
        }
      })}
    </div>
  );
}
