import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Select, SelectItem, Slider } from "@nextui-org/react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { LuPlus, LuSave } from "react-icons/lu";
import { z } from "zod";
import SystemMessage, {
  SystemMessageSchema,
} from "./components/system-message";
import UserMessage, { UserMessageSchema } from "./components/user-message";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import supabase from "utils/supabase";
import { Database } from "supabase/types";
import toast from "react-hot-toast";
import { useAuth } from "contexts/auth-context";
import FullSpinner from "components/full-spinner";
import useWorkspacesStore from "stores/workspaces";
import Name from "./components/name";

type Version = Database["public"]["Tables"]["versions"]["Row"];
type Provider = {
  id: string;
  type: string;
  name: string;
};

const MessageSchema = z.union([SystemMessageSchema, UserMessageSchema]);

const FormSchema = z.object({
  name: z.string().min(2, "Name is too short."),
  provider_id: z.string().uuid().or(z.null()),
  messages: z.array(MessageSchema),
  params: z.object({
    temprature: z.number().min(0).max(2),
    max_tokens: z.number().min(1).max(4095),
  }),
});

type FormValues = z.infer<typeof FormSchema>;

export default function PromptDetailsPage() {
  const { session } = useAuth();
  const { activeWorkspace } = useWorkspacesStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [versions, setVersions] = useState<Version[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);

  const { promptId } = useParams<{ promptId: string }>();
  const { handleSubmit, control, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "Untitled prompt",
      provider_id: null,
      messages: [
        {
          role: "system",
          content: "",
        },
      ],
      params: {
        temprature: 1,
        max_tokens: 256,
      },
    },
  });

  const {
    fields: messages,
    append: addMessage,
    remove: removeMessage,
  } = useFieldArray({
    name: "messages",
    control,
  });

  useEffect(() => {
    const init = async () => {
      try {
        if (!promptId || !activeWorkspace) {
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

        if (promptId === "create") {
          return;
        }

        setLoading(true);

        const { data: prompt, error: promptReadError } = await supabase
          .from("prompts")
          .select("*")
          .eq("id", promptId)
          .single();

        if (promptReadError) {
          throw promptReadError;
        }

        const { data: versions, error: versionsReadError } = await supabase
          .from("versions")
          .select("*")
          .eq("prompt_id", promptId)
          .order("number", { ascending: false });

        if (versionsReadError) {
          throw versionsReadError;
        }

        setVersions(versions);

        const latestVersion =
          versions.length > 0
            ? (versions[0].data as {
                messages?: FormValues["messages"];
              })
            : {};

        const params = prompt.params as {
          temprature?: number;
          max_tokens?: number;
        };

        const payload = {
          name: prompt.name === "" ? "Untitled prompt" : prompt.name,
          provider_id: prompt.provider_id,
          params: {
            temprature: 1,
            max_tokens: 256,
            ...params,
          },
          messages: [
            {
              role: "system" as const,
              content: "",
            },
          ],
          ...latestVersion,
        };

        reset(payload);

        setLoading(false);
      } catch {
        toast.error("Oops! Something went wrong.");
      }
    };

    init();
  }, [activeWorkspace, promptId, reset]);

  const save = useCallback(
    async (values: FormValues) => {
      try {
        console.log(values);
        if (!promptId || !session) {
          return;
        }

        setSaving(true);

        if (promptId === "create") {
          return;
        }

        const number = versions.length > 0 ? versions[0].number + 1 : 1;

        await supabase
          .from("prompts")
          .update({
            name: values.name,
            provider_id: values.provider_id,
            params: values.params,
            updated_at: new Date().toISOString(),
          })
          .eq("id", promptId);

        const { data, error } = await supabase
          .from("versions")
          .insert({
            prompt_id: promptId,
            number,
            data: {
              messages: values.messages,
            },
            user_id: session?.user.id,
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        setVersions((prev) => [data, ...prev]);

        reset(values);

        toast.success("Saved successfully.");
      } catch {
        toast.error("Oops! Something went wrong.");
      } finally {
        setSaving(false);
      }
    },
    [promptId, reset, session, versions]
  );

  if (loading) {
    return <FullSpinner />;
  }

  return (
    <div className="h-full">
      <form className="h-full flex flex-col" onSubmit={handleSubmit(save)}>
        <div className="flex justify-between items-center bg-background px-3 h-12 border-b">
          <div className="flex items-center">
            <h2 className="font-medium">Prompts</h2>
            <p className="font-medium ml-2">{">"}</p>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Name value={field.value} onValueChange={field.onChange} />
              )}
            />
            {versions.length > 0 && (
              <div className="bg-default-100 rounded-lg px-2 py-1 flex justify-center items-center mr-2">
                <span className="text-xs font-bold">v{versions[0].number}</span>
              </div>
            )}
            {formState.isDirty && (
              <div className="bg-default-100 text-default-600 rounded-lg px-2 py-1 flex justify-center items-center">
                <span className="text-xs font-bold">UNSAVED</span>
              </div>
            )}
          </div>

          <Button
            isLoading={saving}
            type="submit"
            size="sm"
            color="primary"
            startContent={<LuSave />}
          >
            Save
          </Button>
        </div>
        <div className="flex-1 flex overflow-y-hidden ">
          <div className="flex-1 h-full overflow-y-auto border-r">
            {messages.map((field, index) => {
              if (field.role === "system") {
                return (
                  <Controller
                    key={field.id}
                    name={`messages.${index}`}
                    control={control}
                    render={({ field, fieldState }) => (
                      <SystemMessage
                        value={
                          field.value as z.infer<typeof SystemMessageSchema>
                        }
                        onValueChange={field.onChange}
                        isInvalid={fieldState.invalid}
                      />
                    )}
                  />
                );
              }

              if (field.role === "user") {
                return (
                  <Controller
                    key={field.id}
                    name={`messages.${index}`}
                    control={control}
                    render={({ field, fieldState }) => (
                      <UserMessage
                        value={field.value as z.infer<typeof UserMessageSchema>}
                        onValueChange={field.onChange}
                        isInvalid={fieldState.invalid}
                        onRemove={() => removeMessage(index)}
                      />
                    )}
                  />
                );
              }

              return null;
            })}
            <div className="p-3">
              <Button
                color="primary"
                size="sm"
                startContent={<LuPlus />}
                onPress={() =>
                  addMessage({
                    role: "user",
                    content: [{ type: "text", text: "" }],
                  })
                }
              >
                User
              </Button>
            </div>
          </div>
          <div className="flex-1 border-r">2</div>
          <div className="w-56 p-3 flex flex-col gap-8">
            <Controller
              name="provider_id"
              control={control}
              render={({ field, fieldState }) => (
                <Select
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
              name="params.temprature"
              control={control}
              render={({ field }) => (
                <Slider
                  size="sm"
                  label="Temprature"
                  minValue={0}
                  maxValue={2}
                  step={0.01}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            <Controller
              name="params.max_tokens"
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
          </div>
        </div>
      </form>
    </div>
  );
}
