import { Button } from "@nextui-org/react";
import { useMemo } from "react";
import { LuBraces } from "react-icons/lu";
import { extractVariables } from "utils/variables";

export default function VariablesList({
  text,
  variableValues,
  openVariablesDialog,
}: {
  text: string;
  variableValues: Map<string, string>;
  openVariablesDialog: () => void;
}) {
  const extracted = useMemo(() => extractVariables(text), [text]);

  return (
    <div className="flex flex-wrap w-full gap-1">
      {extracted.map((e) => {
        const value = variableValues.get(e);

        return (
          <Button
            onPress={openVariablesDialog}
            className="shrink-0 h-6 gap-1 px-2 font-medium"
            size="sm"
            variant="flat"
            color={value === undefined ? "warning" : "success"}
            startContent={<LuBraces className="w-3 h-3" />}
          >
            {e.length > 20 ? `${e.slice(0, 20)}...` : e}
          </Button>
        );
      })}
    </div>
  );
}
