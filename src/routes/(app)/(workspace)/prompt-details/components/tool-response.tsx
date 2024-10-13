import { LuFunctionSquare } from "react-icons/lu";

export default function ToolResponse({
  value,
}: {
  value: {
    id: string;
    type: "function";
    function: {
      name: string;
      arguments: string;
    };
  };
}) {
  return (
    <div className="px-3 py-2 border-2 rounded-xl">
      <div className="flex items-center gap-2 mb-2">
        <LuFunctionSquare className="size-4" />
        <p className="text-sm font-medium">{value.function.name}</p>
      </div>

      <div>
        <p className="text-sm text-default-500">{value.function.arguments}</p>
      </div>
    </div>
  );
}
