import { Button, cn, Textarea } from "@nextui-org/react";
import { LuCornerUpLeft } from "react-icons/lu";
import ReactTextareaAutosize from "react-textarea-autosize";

export default function Response({
  value,
  onAddToConversation,
}: {
  value: string;
  onAddToConversation: () => void;
}) {
  return (
    <>
      <div
        className={cn(
          "relative w-full inline-flex tap-highlight-transparent shadow-sm px-3 rounded-medium flex-col !duration-150 transition-all motion-reduce:transition-none py-2 bg-default-100 hover:bg-default-200 focus-within:!bg-default-100"
        )}
      >
        <label htmlFor="system" className="block text-xs font-medium mb-2">
          RESPONSE
        </label>

        <ReactTextareaAutosize
          readOnly
          className="outline-none w-full text-sm resize-none mb-4 bg-transparent"
          placeholder="Run prompt to see assistant response"
          minRows={1}
          maxRows={100000}
          value={value}
        />
      </div>

      <div>
        {value.length > 0 && (
          <Button
            size="sm"
            variant="light"
            startContent={<LuCornerUpLeft />}
            onPress={onAddToConversation}
          >
            Add to conversation
          </Button>
        )}
      </div>
    </>
  );

  return (
    <div className="p-3 flex flex-col border-b gap-2">
      <div className="flex justify-between items-center">
        <div className="bg-default-100 px-3 py-1 text-xs font-bold rounded-xl">
          <h4>RESPONSE</h4>
        </div>
      </div>

      <Textarea
        minRows={20}
        maxRows={100000}
        placeholder="Run prompt to see assistant response"
        value={value}
      />
      <div>
        {value.length > 0 && (
          <Button
            size="sm"
            variant="light"
            startContent={<LuCornerUpLeft />}
            onPress={onAddToConversation}
          >
            Add to conversation
          </Button>
        )}
      </div>
    </div>
  );
}
