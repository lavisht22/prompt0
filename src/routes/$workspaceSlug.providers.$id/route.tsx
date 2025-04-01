import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input, Select, SelectItem } from "@nextui-org/react";
import FullSpinner from "components/full-spinner";
import ProviderIcon from "components/provider-icon";
import { useCallback, useEffect, useState } from "react";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import toast from "react-hot-toast";
import { LuPlus, LuSave, LuX } from "react-icons/lu";
import { useNavigate, useParams } from "react-router-dom";
import useWorkspacesStore from "stores/workspaces";
import supabase from "utils/supabase";
import { z } from "zod";
import AzureOpenAIForm, { AzureOpenAIFormSchema } from "./azure-openai-form";
import BedrockForm, { BedrockFormSchema } from "./bedrock-form";
import OpenAIForm from "./openai-form";

// Functions to mask the key with leving first 4 and last 4 characters
function maskKey(key: string) {
  return key.slice(0, 4) + "*".repeat(key.length - 8) + key.slice(-4);
}

const FormSchema = z
  .object({
    name: z.string().min(1),
    type: z.enum(["openai", "anthropic", "azure-openai", "bedrock"]),
    key: z.string().min(1),
    options: z.record(z.any()),
    models: z
      .array(
        z.object({
          label: z.string().min(1),
          value: z.string().min(1),
        })
      )
      .optional(),
  })
  .superRefine((data, ctx) => {
    const OptionsSchemas = {
      "azure-openai": AzureOpenAIFormSchema,
      bedrock: BedrockFormSchema,
    };

    const OptionsSchema =
      OptionsSchemas[data.type as keyof typeof OptionsSchemas];

    if (OptionsSchema) {
      const result = OptionsSchema.safeParse(data.options);

      if (!result.success) {
        result.error.issues.forEach((issue) =>
          ctx.addIssue({
            ...issue,
            path: ["options", ...issue.path],
          })
        );
      }
    }
  });

export type FormValues = z.infer<typeof FormSchema>;

const defaultValues: FormValues = {
  name: "",
  type: "openai",
  key: "",
  options: {},
  models: [],
};

export default function ProviderDetailsPage() {
  const { activeWorkspace } = useWorkspacesStore();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { providerId } = useParams<{ providerId: string }>();

  const { handleSubmit, control, reset, getFieldState, watch } =
    useForm<FormValues>({
      resolver: zodResolver(FormSchema),
      defaultValues,
    });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "models",
  });

  useEffect(() => {
    const init = async () => {
      try {
        if (!providerId || !activeWorkspace) {
          return;
        }

        if (providerId === "add") {
          setLoading(false);
          return;
        }

        setLoading(true);

        const { data: provider, error: providerReadError } = await supabase
          .from("providers")
          .select("*")
          .eq("id", providerId)
          .single();

        if (providerReadError) {
          throw providerReadError;
        }

        reset(provider as unknown as FormValues);
        setLoading(false);
      } catch {
        toast.error("Oops! Something went wrong.");
      }
    };

    init();
  }, [activeWorkspace, providerId, reset]);

  const save = useCallback(
    async (values: FormValues) => {
      try {
        if (!providerId || !activeWorkspace) {
          return;
        }

        setSaving(true);

        if (providerId === "add") {
          const { data: newProvider, error: newProviderError } = await supabase
            .from("providers")
            .insert({
              ...values,
              key: maskKey(values.key),
              workspace_id: activeWorkspace.id,
            })
            .select()
            .single();

          if (newProviderError) {
            throw newProviderError;
          }

          await supabase.from("keys").insert({
            provider_id: newProvider.id,
            value: values.key,
          });

          if (newProviderError) {
            throw newProviderError;
          }

          navigate(`/${activeWorkspace.slug}/providers/${newProvider.id}`, {
            replace: true,
          });
        } else {
          const { error: updateError } = await supabase
            .from("providers")
            .update({
              ...values,
              key: maskKey(values.key),
              updated_at: new Date().toISOString(),
            })
            .eq("id", providerId)
            .throwOnError();

          if (updateError) {
            throw updateError;
          }

          if (getFieldState("key").isDirty) {
            await supabase
              .from("keys")
              .update({
                value: values.key,
              })
              .eq("provider_id", providerId)
              .throwOnError();
          }

          reset({ ...values, key: maskKey(values.key) });

          toast.success("Provider updated successfully");
          navigate(-1);
        }
      } catch (error) {
        console.error(error);
        toast.error("Oops! Something went wrong.");
      } finally {
        setSaving(false);
      }
    },
    [activeWorkspace, getFieldState, navigate, providerId, reset]
  );

  if (loading) {
    return <FullSpinner />;
  }

  return (
    <div className="h-full">
      <form className="h-full flex flex-col" onSubmit={handleSubmit(save)}>
        <div className="flex justify-between items-center bg-background px-3 h-12 border-b">
          <div className="flex items-center">
            <h2 className="font-medium">Providers</h2>
            <p className="font-medium mx-2">{">"}</p>
            <h2 className="font-medium">Update Provider</h2>
          </div>
          <div className="flex">
            <Button
              type="submit"
              size="sm"
              color="primary"
              isLoading={saving}
              startContent={<LuSave />}
            >
              Save
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col justify-center items-center p-4">
          <div className="flex flex-col w-full max-w-lg gap-y-8">
            <div className="flex flex-col w-full gap-4">
              <Controller
                name="name"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    isRequired
                    fullWidth
                    label="Name"
                    value={field.value}
                    onValueChange={field.onChange}
                    isInvalid={fieldState.invalid}
                  />
                )}
              />
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select
                    isRequired
                    label="Type"
                    disallowEmptySelection
                    selectedKeys={new Set([field.value])}
                    onSelectionChange={(keys) => {
                      const arr = Array.from(keys) as string[];
                      field.onChange(arr[0]);
                    }}
                  >
                    <SelectItem
                      key="anthropic"
                      value="anthropic"
                      startContent={<ProviderIcon type="anthropic" />}
                    >
                      Anthropic
                    </SelectItem>
                    <SelectItem
                      key="azure-openai"
                      value="azure-openai"
                      startContent={<ProviderIcon type="azure-openai" />}
                    >
                      Azure OpenAI
                    </SelectItem>
                    <SelectItem
                      key="openai"
                      value="openai"
                      startContent={<ProviderIcon type="openai" />}
                    >
                      OpenAI
                    </SelectItem>
                    <SelectItem
                      key="bedrock"
                      value="bedrock"
                      startContent={<ProviderIcon type="bedrock" />}
                    >
                      Bedrock
                    </SelectItem>
                  </Select>
                )}
              />
              <Controller
                name="key"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    isRequired
                    fullWidth
                    label="API Key / Secret Access Key"
                    value={field.value}
                    onValueChange={field.onChange}
                    isInvalid={fieldState.invalid}
                  />
                )}
              />
            </div>

            {watch().type === "openai" && <OpenAIForm control={control} />}

            {watch().type === "azure-openai" && (
              <AzureOpenAIForm control={control} />
            )}
            {watch().type === "bedrock" && <BedrockForm control={control} />}

            {/* Models section */}
            <div className="flex flex-col w-full gap-4">
              <h5 className="text-sm font-medium text-default-500">
                Models (optional)
              </h5>

              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <Controller
                    name={`models.${index}.label`}
                    control={control}
                    render={({ field, fieldState }) => (
                      <Input
                        fullWidth
                        label="Model Label"
                        placeholder="e.g., GPT-4"
                        value={field.value}
                        onValueChange={field.onChange}
                        isInvalid={fieldState.invalid}
                      />
                    )}
                  />
                  <Controller
                    name={`models.${index}.value`}
                    control={control}
                    render={({ field, fieldState }) => (
                      <Input
                        fullWidth
                        label="Model Value"
                        placeholder="e.g., gpt-4"
                        value={field.value}
                        onValueChange={field.onChange}
                        isInvalid={fieldState.invalid}
                      />
                    )}
                  />
                  <Button
                    isIconOnly
                    color="danger"
                    variant="light"
                    onPress={() => remove(index)}
                  >
                    <LuX className="size-4" />
                  </Button>
                </div>
              ))}
              <Button
                fullWidth
                onPress={() => append({ label: "", value: "" })}
                startContent={<LuPlus />}
                variant="flat"
              >
                Add Model
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
