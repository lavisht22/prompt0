import { Button } from "@nextui-org/react";
import { useMemo } from "react";
import { LuBraces } from "react-icons/lu";
import { extractVariables } from "utils/variables";

export default function VariablesList({ text }: { text: string }) {
  const extracted = useMemo(() => extractVariables(text), [text]);

  return (
    <div className="flex gap-2">
      {extracted.map((e) => (
        <Button
          size="sm"
          variant="flat"
          color="primary"
          radius="full"
          startContent={<LuBraces />}
        >
          {e}
        </Button>
      ))}
    </div>
  );
}
