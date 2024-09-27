import {
  Select,
  SelectItem,
  Slider,
  Autocomplete,
  AutocompleteItem,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import { Control, Controller, useWatch } from "react-hook-form";
import useWorkspacesStore from "stores/workspaces";
import { FormValues } from "../prompt";
import supabase from "utils/supabase";

type Provider = {
  id: string;
  type: string;
  name: string;
};

export default function Params({ control }: { control: Control<FormValues> }) {
  const { activeWorkspace } = useWorkspacesStore();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [modelSuggestions, setModelSuggestions] = useState<string[]>([]);

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

  const selectedProviderId = useWatch({
    control,
    name: "provider_id",
  });

  useEffect(() => {
    const getModelSuggestions = async () => {
      if (!selectedProviderId) {
        setModelSuggestions([]);
        return;
      }

      const selectedProvider = providers.find(
        (p) => p.id === selectedProviderId
      );
      if (!selectedProvider) return;

      // Here you would fetch the model suggestions based on the provider type
      // This is a placeholder, replace with actual API call or data source
      const suggestions = await fetchModelSuggestions(selectedProvider.type);
      setModelSuggestions(suggestions);
    };

    getModelSuggestions();
  }, [selectedProviderId, providers]);

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
            disallowEmptySelection
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
          <Autocomplete
            label="Model"
            placeholder="Select a model"
            isInvalid={fieldState.invalid}
            onSelectionChange={(key) => field.onChange(key)}
            allowsCustomValue
            inputValue={field.value}
            onInputChange={field.onChange}
          >
            {modelSuggestions.map((model) => (
              <AutocompleteItem key={model} value={model}>
                {model}
              </AutocompleteItem>
            ))}
          </Autocomplete>
        )}
      />

      <Controller
        name="response_format.type"
        control={control}
        render={({ field, fieldState }) => (
          <Select
            label="Response Format"
            isInvalid={fieldState.invalid}
            selectedKeys={new Set([field.value || ""])}
            onSelectionChange={(selectedKeys) => {
              const arr = Array.from(selectedKeys);
              field.onChange(arr[0]);
            }}
          >
            <SelectItem key="text" value="text">
              text
            </SelectItem>
            <SelectItem key="json_object" value="json_object">
              json_object
            </SelectItem>
          </Select>
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

async function fetchModelSuggestions(providerType: string): Promise<string[]> {
  // Replace this with actual API call or data source
  switch (providerType) {
    case "openai":
      return [
        "o1-mini",
        "o1-preview",
        "gpt-4o-mini",
        "gpt-4o",
        "gpt-4-turbo",
        "gpt-4",
        "chatgpt-4o-latest",
      ];
    case "anthropic":
      return [
        "claude-3-5-sonnet-20240620",
        "claude-3-opus-20240229",
        "claude-3-sonnet-20240229",
        "claude-3-haiku-20240307",
      ];
    default:
      return [];
  }
}
