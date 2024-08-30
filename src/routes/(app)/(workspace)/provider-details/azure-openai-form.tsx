import { Input } from "@nextui-org/react";
import { Control, Controller } from "react-hook-form";
import { z } from "zod";

import { FormValues } from "./page";

export const AzureOpenAIFormSchema = z.object({
  endpoint: z.string().min(1),
});

export default function AzureOpenAIForm({
  control,
}: {
  control: Control<FormValues>;
}) {
  return (
    <>
      <h5 className="mt-8 text-sm font-medium text-default-500">
        Azure OpenAI Options
      </h5>
      <Controller
        control={control}
        name="options.endpoint"
        render={({ field, fieldState }) => (
          <Input
            isRequired
            label="Endpoint"
            value={field.value}
            onValueChange={field.onChange}
            isInvalid={fieldState.invalid}
          />
        )}
      />
    </>
  );
}
