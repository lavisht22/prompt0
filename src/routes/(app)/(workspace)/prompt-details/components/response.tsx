import { Button, Card, CardBody, Chip, Textarea } from "@nextui-org/react";
import { LuCornerUpLeft } from "react-icons/lu";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
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
      <Card>
        <CardBody className="gap-4">
          <Chip size="sm" variant="flat" color="secondary">
            RESPONSE
          </Chip>

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
            <Textarea
              variant="bordered"
              readOnly
              placeholder="Run prompt to see assistant response"
              minRows={1}
              maxRows={100000}
              value={value}
            />
          )}

          <div>
            {value.length > 0 && (
              <Button
                size="sm"
                variant="flat"
                startContent={<LuCornerUpLeft />}
                onPress={onAddToConversation}
              >
                Add to conversation
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    </>
  );
}
