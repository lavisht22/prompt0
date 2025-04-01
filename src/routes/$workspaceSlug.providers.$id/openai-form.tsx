import { Input } from "@nextui-org/react";
import { Control, Controller } from "react-hook-form";
import { z } from "zod";

import { FormValues } from "./route";

export const OpenAIFormSchema = z.object({
  baseUrl: z.string().optional(),
});

export default function OpenAIForm({
  control,
}: {
  control: Control<FormValues>;
}) {
  return (
    <div className="flex flex-col w-full gap-4">
      <h5 className="text-sm font-medium text-default-500">OpenAI Options</h5>
      <Controller
        control={control}
        name="options.baseUrl"
        render={({ field, fieldState }) => (
          <Input
            label="Base URL"
            value={field.value}
            onValueChange={field.onChange}
            isInvalid={fieldState.invalid}
            description="Optional"
          />
        )}
      />
    </div>
  );
}
