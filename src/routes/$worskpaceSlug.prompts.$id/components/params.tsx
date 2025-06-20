import { Input, Select, SelectItem, Slider, Switch } from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useWatch, useFormContext } from "react-hook-form";
import useWorkspacesStore from "stores/workspaces";
import { FormValues } from "../prompt";
import supabase from "utils/supabase";
import { LuFunctionSquare } from "react-icons/lu";

type Provider = {
  id: string;
  type: string;
  name: string;
  models: {
    label: string;
    value: string;
  }[];
};

export default function Params() {
  const { activeWorkspace } = useWorkspacesStore();
  const [providers, setProviders] = useState<Provider[]>([]);

  const { setValue, control, getValues } = useFormContext<FormValues>();

  useEffect(() => {
    const init = async () => {
      if (!activeWorkspace) {
        return;
      }

      const { data: providers, error: providersReadError } = await supabase
        .from("providers")
        .select("id, type, name, models")
        .eq("workspace_id", activeWorkspace.id);

      if (providersReadError) {
        throw providersReadError;
      }

      setProviders(providers as Provider[]);
    };

    init();
  }, [activeWorkspace]);

  const tools = useWatch({
    control,
    name: "tools",
  });

  const provider_id = useWatch({ control, name: "provider_id" });

  const modelOptions = useMemo(() => {
    const provider = providers.find((provider) => provider.id === provider_id);

    if (!provider) {
      return [];
    }

    return provider.models.map((model) => ({
      label: model.label,
      key: model.value,
    }));
  }, [providers, provider_id]);

  useEffect(() => {
    if (!tools || tools.length === 0) {
      setValue("parallel_tool_calls", undefined);
      setValue("tool_choice", undefined);
    }

    const values = getValues();

    if (tools && tools.length > 0 && values.parallel_tool_calls === undefined) {
      setValue("parallel_tool_calls", false);
    }

    if (tools && tools.length > 0 && values.tool_choice === undefined) {
      setValue("tool_choice", "auto");
    }
  }, [tools, setValue, getValues]);

  return (
    <>
      <Controller
        name="provider_id"
        control={control}
        render={({ field, fieldState }) => (
          <Select
            variant="bordered"
            size="sm"
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
              <SelectItem key={provider.id}>{provider.name}</SelectItem>
            ))}
          </Select>
        )}
      />

      <Controller
        name="model"
        control={control}
        render={({ field, fieldState }) => (
          <Select
            variant="bordered"
            size="sm"
            label="Model"
            placeholder="Model"
            multiple={false}
            selectedKeys={field.value ? new Set([field.value]) : undefined}
            onSelectionChange={(selectedKeys) => {
              const arr = Array.from(selectedKeys);
              field.onChange(arr[0]);
            }}
            isInvalid={fieldState.invalid}
          >
            {modelOptions.map((item) => (
              <SelectItem key={item.key} textValue={item.key}>
                <span className="block">{item.label}</span>
                <span className="block text-xs text-default-500">
                  {item.key}
                </span>
              </SelectItem>
            ))}
          </Select>
        )}
      />

      <Controller
        name="response_format.type"
        control={control}
        render={({ field, fieldState }) => (
          <Select
            variant="bordered"
            size="sm"
            label="Response Format"
            isInvalid={fieldState.invalid}
            selectedKeys={new Set([field.value || ""])}
            onSelectionChange={(selectedKeys) => {
              const arr = Array.from(selectedKeys);
              field.onChange(arr[0]);
            }}
          >
            <SelectItem key="text">text</SelectItem>
            <SelectItem key="json_object">json_object</SelectItem>
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
            classNames={{
              label: "text-xs",
            }}
            minValue={0}
            maxValue={2}
            step={0.01}
            value={field.value}
            onChange={field.onChange}
            renderValue={() => {
              return (
                <Input
                  className="w-16"
                  size="sm"
                  value={field.value === 0 ? "" : field.value.toString()}
                  classNames={{
                    input: "text-xs",
                  }}
                  placeholder="0"
                  variant="bordered"
                  onValueChange={(newValue) => {
                    try {
                      if (newValue === "") {
                        field.onChange(0);
                        return;
                      }

                      const value = parseFloat(newValue);

                      if (value && value >= 0 && value <= 2) {
                        field.onChange(value);
                      }
                    } catch (error) {
                      console.error(error);
                    }
                  }}
                />
              );
            }}
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
            classNames={{
              label: "text-xs",
            }}
            minValue={1}
            maxValue={16384}
            value={field.value}
            onChange={field.onChange}
            renderValue={() => {
              return (
                <Input
                  className="w-16"
                  classNames={{
                    input: "text-xs",
                  }}
                  placeholder="1"
                  variant="bordered"
                  size="sm"
                  value={field.value === 0 ? "" : field.value.toString()}
                  onValueChange={(newValue) => {
                    try {
                      if (newValue === "") {
                        field.onChange(0);
                        return;
                      }

                      const value = parseInt(newValue);

                      if (value && value > 0 && value <= 16384) {
                        field.onChange(value);
                      }
                    } catch (error) {
                      console.error(error);
                    }
                  }}
                />
              );
            }}
          />
        )}
      />

      <Controller
        name="reasoning_effort"
        control={control}
        render={({ field, fieldState }) => (
          <Select
            variant="bordered"
            size="sm"
            label="Reasoning Effort"
            aria-label="Reasoning Effort"
            placeholder="Select reasoning effort"
            isInvalid={fieldState.invalid}
            selectedKeys={field.value ? new Set([field.value]) : new Set()}
            onSelectionChange={(selectedKeys) => {
              const arr = Array.from(selectedKeys);

              if (arr.length === 0) {
                field.onChange(undefined);
              } else {
                field.onChange(arr[0]);
              }
            }}
            description="Only applicable for thinking models. Do not use this for non-thinking models as it will result in an error."
          >
            <SelectItem key="none">none</SelectItem>
            <SelectItem key="low">low</SelectItem>
            <SelectItem key="medium">medium</SelectItem>
            <SelectItem key="high">high</SelectItem>
          </Select>
        )}
      />

      {tools && tools.length > 0 ? (
        <>
          <Controller
            name="tool_choice"
            control={control}
            render={({ field, fieldState }) => {
              let selectedKeys: Set<string> | undefined = undefined;

              if (field.value === "none") {
                selectedKeys = new Set(["none"]);
              } else if (field.value === "auto") {
                selectedKeys = new Set(["auto"]);
              } else if (field.value === "required") {
                selectedKeys = new Set(["required"]);
              } else if (field.value) {
                selectedKeys = new Set([field.value.function.name]);
              } else {
                selectedKeys = undefined;
              }

              return (
                <Select
                  variant="bordered"
                  size="sm"
                  label="Tool Choice"
                  isInvalid={fieldState.invalid}
                  selectedKeys={selectedKeys}
                  onSelectionChange={(selectedKeys) => {
                    const value = Array.from(selectedKeys)[0] as string;

                    if (["none", "auto", "required"].includes(value)) {
                      field.onChange(value);
                    } else {
                      const tool = tools.find(
                        (tool) => tool.function.name === value
                      );

                      if (tool) {
                        field.onChange({
                          type: "function",
                          function: {
                            name: tool.function.name,
                          },
                        });
                      }
                    }
                  }}
                >
                  <SelectItem key="none">none</SelectItem>
                  <SelectItem key="auto">auto</SelectItem>
                  <SelectItem key="required">required</SelectItem>
                  <>
                    {tools.map((tool) => (
                      <SelectItem
                        key={tool.function.name}
                        startContent={<LuFunctionSquare />}
                      >
                        {tool.function.name}
                      </SelectItem>
                    ))}
                  </>
                </Select>
              );
            }}
          />

          <Controller
            name="parallel_tool_calls"
            control={control}
            render={({ field }) => (
              <div className="flex items-center justify-between gap-2">
                <span className="block text-sm">Parallel Tool Calls</span>
                <Switch
                  aria-label="Parallel Tool Calls"
                  size="sm"
                  isSelected={field.value}
                  onValueChange={field.onChange}
                />
              </div>
            )}
          />
        </>
      ) : null}
    </>
  );
}
