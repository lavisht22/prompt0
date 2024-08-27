import { Button, cn } from "@nextui-org/react";
import { LuCornerUpLeft } from "react-icons/lu";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import ReactTextareaAutosize from "react-textarea-autosize";
import { useTheme } from "next-themes";

export default function Response({
  type,
  value,
  onAddToConversation,
}: {
  value: string;
  type: string;
  onAddToConversation: () => void;
}) {
  const { theme } = useTheme();

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

        {type === "json_object" && (
          <CodeMirror
            placeholder="Run prompt to see assistant response"
            value={value}
            extensions={[json(), EditorView.lineWrapping]}
            readOnly
            theme={theme === "dark" ? "dark" : "light"}
            basicSetup={{
              lineNumbers: false,
              foldGutter: false,
            }}
          />
        )}

        {type === "text" && (
          <ReactTextareaAutosize
            readOnly
            className="outline-none w-full text-sm resize-none mb-4 bg-transparent"
            placeholder="Run prompt to see assistant response"
            minRows={1}
            maxRows={100000}
            value={value}
          />
        )}
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
}
