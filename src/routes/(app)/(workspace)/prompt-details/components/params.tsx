import { Input, Select, SelectItem, Slider } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { Control, Controller } from "react-hook-form";
import useWorkspacesStore from "stores/workspaces";
import { FormValues } from "../page";
import supabase from "utils/supabase";

type Provider = {
  id: string;
  type: string;
  name: string;
};

export default function Params({ control }: { control: Control<FormValues> }) {
  const { activeWorkspace } = useWorkspacesStore();
  const [providers, setProviders] = useState<Provider[]>([]);

  useEffect(() => {
    const init = async () => {
      if (!activeWorkspace) {
        return;
      }

      const { data: providers, error: providersReadError } = await supabase
        .from("providers")
        .select("id, type, name")
        .eq("workspace_id", activeWorkspace.id);

      if (providersReadError) {
        throw providersReadError;
      }

      setProviders(providers);
    };

    init();
  }, [activeWorkspace]);

  return (
    <>
      <Controller
        name="provider_id"
        control={control}
        render={({ field, fieldState }) => (
          <Select
            label="Provider"
            aria-label="Provider"
            isInvalid={fieldState.invalid}
            selectedKeys={new Set([field.value || ""])}
            onSelectionChange={(selectedKeys) => {
              const arr = Array.from(selectedKeys);
              field.onChange(arr[0]);
            }}
          >
            {providers.map((provider) => (
              <SelectItem key={provider.id} value={provider.id}>
                {provider.name}
              </SelectItem>
            ))}
          </Select>
        )}
      />

      <Controller
        name="model"
        control={control}
        render={({ field, fieldState }) => (
          <Input
            label="Model"
            placeholder="Model"
            {...field}
            isInvalid={fieldState.invalid}
          />
        )}
      />

      <Controller
        name="temperature"
        control={control}
        render={({ field }) => (
          <Slider
            size="sm"
            label="Temperature"
            minValue={0}
            maxValue={2}
            step={0.01}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />

      <Controller
        name="max_tokens"
        control={control}
        render={({ field }) => (
          <Slider
            size="sm"
            label="Max Tokens"
            minValue={1}
            maxValue={4095}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
    </>
  );
}
