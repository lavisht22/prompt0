import { Input } from "@nextui-org/react";
import { Provider } from "stores/providers";

export default function OpenAIForm({
  options,
  setOptions,
}: {
  options: Provider["options"];
  setOptions: (options: Provider["options"]) => void;
}) {
  return (
    <>
      <Input
        variant="bordered"
        label="API Key"
        value={options?.key}
        onValueChange={(key) => setOptions({ ...options, key })}
      />
    </>
  );
}
