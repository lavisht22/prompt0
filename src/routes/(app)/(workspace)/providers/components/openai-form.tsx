import { Input } from "@nextui-org/react";

export type OpenAIOptions = {
  api_key?: string;
};

export default function OpenAIForm({
  options,
  setOptions,
}: {
  options: OpenAIOptions;
  setOptions: (options: OpenAIOptions) => void;
}) {
  return (
    <>
      <Input
        variant="bordered"
        label="API Key"
        value={options?.api_key}
        onValueChange={(api_key) => setOptions({ ...options, api_key })}
      />
    </>
  );
}
