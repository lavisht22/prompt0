import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input, Select, SelectItem, Slider } from "@nextui-org/react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { LuPlay, LuPlus } from "react-icons/lu";
import { z } from "zod";
import SystemMessage, {
  SystemMessageSchema,
} from "./components/system-message";
import UserMessage, { UserMessageSchema } from "./components/user-message";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import supabase from "utils/supabase";
import { Database } from "supabase/functions/types";
import toast from "react-hot-toast";
import { useAuth } from "contexts/auth-context";
import FullSpinner from "components/full-spinner";
import useWorkspacesStore from "stores/workspaces";
import Name from "./components/name";
import Response from "./components/response";
import { stream } from "fetch-event-stream";
import AssistantMessage, {
  AssistantMessageSchema,
} from "./components/assistant-message";
import { useHotkeys } from "react-hotkeys-hook";

type Version = Database["public"]["Tables"]["versions"]["Row"];

type Provider = {
  id: string;
  type: string;
  name: string;
};

const MessageSchema = z.union([
  SystemMessageSchema,
  UserMessageSchema,
  AssistantMessageSchema,
]);

const FormSchema = z.object({
  messages: z.array(MessageSchema),
  model: z.string(),
  temperature: z.number().min(0).max(2),
  max_tokens: z.number().min(1).max(4095),
  provider_id: z.string().uuid().or(z.null()),
});

type FormValues = z.infer<typeof FormSchema>;

const defaultValues: FormValues = {
  messages: [
    {
      role: "system",
      content: "",
    },
  ],
  model: "gpt-4o",
  temperature: 1,
  max_tokens: 256,
  provider_id: null,
};

export default function PromptDetailsPage() {
  const { session } = useAuth();
  const { activeWorkspace } = useWorkspacesStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [versions, setVersions] = useState<Version[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [name, setName] = useState("");
  const [response, setResponse] = useState("");

  const { promptId } = useParams<{ promptId: string }>();
  const { handleSubmit, control, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues,
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

        setName(prompt.name);

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
            ? {
                ...versions[0],
                messages: versions[0].messages as FormValues["messages"],
              }
            : defaultValues;

        reset(latestVersion as FormValues);

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
        if (!promptId || !session) {
          return;
        }

        setSaving(true);

        let latestVersion = versions[0];

        if (formState.isDirty || !latestVersion) {
          if (promptId === "create") {
            return;
          }

          const number = versions.length > 0 ? versions[0].number + 1 : 1;

          const { data, error } = await supabase
            .from("versions")
            .insert({
              prompt_id: promptId,
              user_id: session?.user.id,
              number,
              ...values,
            })
            .select()
            .single();

          if (error) {
            throw error;
          }

          setVersions((prev) => [data, ...prev]);
          latestVersion = data;

          reset(values);
        }

        setResponse("");

        // Call the run function
        const response = await stream(
          "https://glzragfkzcvgpipkgyrq.supabase.co/functions/v1/run",
          {
            method: "POST",
            body: JSON.stringify({
              prompt_id: promptId,
              version_id: latestVersion.id,
              stream: true,
            }),
            headers: {
              Authorization: `Bearer ${
                import.meta.env.VITE_SUPABASE_ANON_KEY! || ""
              }`,
            },
          }
        );

        for await (const event of response) {
          if (!event.data) {
            continue;
          }

          const data = JSON.parse(event.data) as {
            delta: {
              content: string | null;
            };
          };

          console.log(data);

          setResponse((prev) => (prev += data.delta.content || ""));
        }
      } catch (error) {
        console.error(error);
        toast.error("Oops! Something went wrong.");
      } finally {
        setSaving(false);
      }
    },
    [formState, promptId, reset, session, versions]
  );

  const updateName = useCallback(
    async (newName: string) => {
      try {
        if (!promptId) {
          return;
        }

        await supabase
          .from("prompts")
          .update({ name: newName, updated_at: new Date().toISOString() })
          .eq("id", promptId)
          .throwOnError();

        setName(newName);
      } catch {
        toast.error("Oops! Something went wrong.");
      }
    },
    [promptId]
  );

  useHotkeys("mod+enter", () => handleSubmit(save)(), [save]);

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
            <Name value={name} onValueChange={updateName} />

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
            startContent={<LuPlay />}
          >
            Run
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

              if (field.role === "assistant") {
                return (
                  <Controller
                    key={field.id}
                    name={`messages.${index}`}
                    control={control}
                    render={({ field, fieldState }) => (
                      <AssistantMessage
                        value={
                          field.value as z.infer<typeof AssistantMessageSchema>
                        }
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
            <div className="flex p-3 gap-x-2">
              <Button
                variant="flat"
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
              <Button
                variant="flat"
                size="sm"
                startContent={<LuPlus />}
                onPress={() =>
                  addMessage({
                    role: "assistant",
                    content: "",
                  })
                }
              >
                Assistant
              </Button>
            </div>
          </div>
          <div className="flex-1 border-r">
            <Response
              value={response}
              onAddToConversation={() => {
                addMessage({
                  role: "assistant",
                  content: response,
                });
                setResponse("");
              }}
            />
          </div>
          <div className="w-56 p-3 flex flex-col gap-8">
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
          </div>
        </div>
      </form>
    </div>
  );
}
