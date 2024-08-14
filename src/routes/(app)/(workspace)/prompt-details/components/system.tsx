import { Textarea } from "@nextui-org/react";

export default function System({
  value,
  onValueChange,
  isInvalid,
}: {
  value: string;
  onValueChange: (value: string) => void;
  isInvalid?: boolean;
}) {
  return (
    <Textarea
      label="System Prompt"
      placeholder="Set a system prompt (optional)"
      value={value}
      onValueChange={onValueChange}
      isInvalid={isInvalid}
    />
  );
}
