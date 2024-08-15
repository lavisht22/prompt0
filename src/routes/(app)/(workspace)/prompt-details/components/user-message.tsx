import { Button, Textarea } from "@nextui-org/react";
import { useState } from "react";
import { LuImage, LuTrash2, LuType } from "react-icons/lu";

export default function UserMessage() {
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
          <Button variant="light" size="sm" isIconOnly radius="full">
            <LuTrash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <Textarea
        aria-label="User message"
        placeholder="Enter user message..."
        maxRows={100000}
      />
    </div>
  );
}
