import { Input } from "@heroui/react";
import { Control, Controller } from "react-hook-form";
import { z } from "zod";

import { FormValues } from "./route";

export const AzureOpenAIFormSchema = z.object({
  endpoint: z.string().min(1),
  deployment: z.string().min(1),
  apiVersion: z.string().min(1),
});

export default function AzureOpenAIForm({
  control,
}: {
  control: Control<FormValues>;
}) {
  return (
    <div className="flex flex-col w-full gap-4">
      <h5 className="text-sm font-medium text-default-500">
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
      <Controller
        control={control}
        name="options.deployment"
        render={({ field, fieldState }) => (
          <Input
            isRequired
            label="Deployment"
            value={field.value}
            onValueChange={field.onChange}
            isInvalid={fieldState.invalid}
          />
        )}
      />
      <Controller
        control={control}
        name="options.apiVersion"
        render={({ field, fieldState }) => (
          <Input
            isRequired
            label="API Version"
            value={field.value}
            onValueChange={field.onChange}
            isInvalid={fieldState.invalid}
          />
        )}
      />
    </div>
  );
}
