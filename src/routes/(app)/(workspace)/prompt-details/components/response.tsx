import { Button, Textarea } from "@nextui-org/react";
import { LuCornerUpLeft } from "react-icons/lu";

export default function Response({ value }: { value: string }) {
  return (
    <div className="p-3 flex flex-col border-b gap-2">
      <div className="flex justify-between items-center">
        <div className="bg-default-100 px-3 py-1 text-xs font-bold rounded-xl">
          <h4>RESPONSE</h4>
        </div>
      </div>

      <Textarea
        isReadOnly
        minRows={20}
        maxRows={100000}
        placeholder="Run prompt to see assistant response"
        value={value}
      />
      <div>
        {value.length > 0 && (
          <Button
            size="sm"
            variant="flat"
            color="primary"
            startContent={<LuCornerUpLeft />}
          >
            Add to conversation
          </Button>
        )}
      </div>
    </div>
  );
}
