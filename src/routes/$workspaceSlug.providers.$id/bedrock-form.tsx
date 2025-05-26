import { Input } from "@heroui/react";
import { Control, Controller } from "react-hook-form";
import { z } from "zod";

import { FormValues } from "./route";

export const BedrockFormSchema = z.object({
  region: z.string().min(1),
  accessKeyId: z.string().min(1),
});

export default function BedrockForm({
  control,
}: {
  control: Control<FormValues>;
}) {
  return (
    <div className="flex flex-col w-full gap-4">
      <h5 className="text-sm font-medium text-default-500">Bedrock Options</h5>
      <Controller
        control={control}
        name="options.region"
        render={({ field, fieldState }) => (
          <Input
            isRequired
            label="Region"
            value={field.value}
            onValueChange={field.onChange}
            isInvalid={fieldState.invalid}
          />
        )}
      />
      <Controller
        control={control}
        name="options.accessKeyId"
        render={({ field, fieldState }) => (
          <Input
            isRequired
            label="Access Key ID"
            value={field.value}
            onValueChange={field.onChange}
            isInvalid={fieldState.invalid}
          />
        )}
      />
      <p className="text-sm text-default-500">
        * Please use the above{" "}
        <span className="font-medium">API Key / Secret Access Key</span> field
        to store secret access key securely.
      </p>
    </div>
  );
}
