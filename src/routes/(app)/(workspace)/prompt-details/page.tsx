import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Kbd } from "@nextui-org/react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { LuBraces, LuPlay, LuPlus } from "react-icons/lu";
import { z } from "zod";
import SystemMessage, {
  SystemMessageSchema,
} from "./components/system-message";
import UserMessage, { UserMessageSchema } from "./components/user-message";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import supabase from "utils/supabase";
import { Database } from "supabase/functions/types";
import toast from "react-hot-toast";
import FullSpinner from "components/full-spinner";
import useWorkspacesStore from "stores/workspaces";
import Name from "./components/name";
import Response from "./components/response";
import { stream } from "fetch-event-stream";
import AssistantMessage, {
  AssistantMessageSchema,
} from "./components/assistant-message";
import { useHotkeys } from "react-hotkeys-hook";
import VariablesDialog from "./components/variables-dialog";
import { extractVaraiblesFromMessages } from "utils/variables";
import Params from "./components/params";
import { generatePromptName } from "utils/prompt";
import Deploy from "./components/deploy";
import History from "./components/history";

export type Version = Database["public"]["Tables"]["versions"]["Row"];

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
  provider_id: z.string().uuid(),
  response_format: z.object({
    type: z.union([z.literal("json_object"), z.literal("text")]),
  }),
});

export type FormValues = z.infer<typeof FormSchema>;

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
  provider_id: "",
  response_format: {
    type: "text",
  },
};

export default function PromptDetailsPage() {
  const { activeWorkspace } = useWorkspacesStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [versions, setVersions] = useState<Version[]>([]);
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [response, setResponse] = useState("");
  const [variablesOpen, setVariablesOpen] = useState(false);
  const [variableValues, setVariableValues] = useState<Map<string, string>>(
    new Map()
  );

  const { promptId } = useParams<{ promptId: string }>();

  const { handleSubmit, control, reset, formState, getValues } =
    useForm<FormValues>({
      resolver: zodResolver(FormSchema),
      defaultValues,
    });

  const activeVersion = useMemo(() => {
    return versions.find((v) => v.id === activeVersionId) || null;
  }, [activeVersionId, versions]);

  useEffect(() => {
    if (activeVersion !== null) {
      reset(activeVersion as unknown as FormValues);
    }
  }, [activeVersion, reset]);

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

        if (promptId === "create") {
          setLoading(false);
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
        setActiveVersionId(versions[0].id);

        setLoading(false);
      } catch {
        toast.error("Oops! Something went wrong.");
      }
    };

    init();
  }, [activeWorkspace, promptId, reset]);

  const generate = useCallback(
    async (
      promptId: string,
      versionId: string,
      variables: Map<string, string>
    ) => {
      setResponse("");

      const response = await stream(
        "https://glzragfkzcvgpipkgyrq.supabase.co/functions/v1/run",
        {
          method: "POST",
          body: JSON.stringify({
            prompt_id: promptId,
            version_id: versionId,
            stream: true,
            variables: Object.fromEntries(variables),
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

        setResponse((prev) => (prev += data.delta.content || ""));
      }
    },
    []
  );

  const save = useCallback(
    async (values: FormValues) => {
      try {
        if (!promptId || !activeWorkspace) {
          return;
        }

        const variables = extractVaraiblesFromMessages(values.messages);

        const cleanedVariables = new Map<string, string>();

        // Check if each variable has a value
        for (const variable of variables) {
          const variableValue = variableValues.get(variable);
          if (variableValue === undefined || variableValue.length === 0) {
            setVariablesOpen(true);
            return;
          } else {
            cleanedVariables.set(variable, variableValue);
          }
        }

        setVariableValues(cleanedVariables);

        setSaving(true);

        let promptIdToBeUsed: string = promptId;
        let versionIdToBeUsed: string = activeVersionId || "";

        if (formState.isDirty) {
          if (promptId === "create") {
            let nameToBeUsed = name;

            if (name === "") {
              const { name: generatedName } = await generatePromptName(
                values.messages
              );

              nameToBeUsed = generatedName;
            }

            setName(nameToBeUsed);

            const { data: createdPrompt, error: createPromptError } =
              await supabase
                .from("prompts")
                .insert({
                  name: nameToBeUsed,
                  workspace_id: activeWorkspace.id,
                })
                .select()
                .single();

            if (createPromptError) {
              throw createPromptError;
            }

            // Update the prompt id without navigating
            window.history.replaceState(
              null,
              "New Page Title",
              `/${activeWorkspace.slug}/prompts/${createdPrompt.id}`
            );

            promptIdToBeUsed = createdPrompt.id;
          }

          const number = Math.max(...versions.map((v) => v.number), 0) + 1;

          const { data, error } = await supabase
            .from("versions")
            .insert({
              prompt_id: promptIdToBeUsed,
              number,
              ...values,
            })
            .select()
            .single();

          if (error) {
            throw error;
          }

          setVersions((prev) => [data, ...prev]);
          setActiveVersionId(data.id);
          versionIdToBeUsed = data.id;
          reset(values);
        }

        // Call the generate function
        await generate(promptIdToBeUsed, versionIdToBeUsed, cleanedVariables);
      } catch (error) {
        console.error(error);
        toast.error("Oops! Something went wrong.");
      } finally {
        setSaving(false);
      }
    },
    [
      activeVersionId,
      activeWorkspace,
      formState.isDirty,
      generate,
      name,
      promptId,
      reset,
      variableValues,
      versions,
    ]
  );

  const openVariablesDialog = useCallback(() => {
    setVariablesOpen(true);
  }, []);

  useHotkeys("mod+enter", () => handleSubmit(save)(), [save]);

  if (loading) {
    return <FullSpinner />;
  }

  if (!promptId) {
    // TODO: Redirect to the prompts page
    return null;
  }

  return (
    <div className="h-full">
      <form className="h-full flex flex-col" onSubmit={handleSubmit(save)}>
        <div className="flex justify-between items-center bg-background px-3 h-12 border-b">
          <div className="flex items-center">
            <h2 className="font-medium">Prompts</h2>
            <p className="font-medium ml-2">{">"}</p>
            <Name value={name} onValueChange={setName} promptId={promptId} />

            {activeVersion && (
              <div className="bg-default-100 rounded-lg px-2 py-1 flex justify-center items-center mr-2">
                <span className="text-xs font-bold">
                  v{activeVersion.number}
                </span>
              </div>
            )}
            {formState.isDirty && (
              <div className="bg-default-100 text-default-600 rounded-lg px-2 py-1 flex justify-center items-center">
                <span className="text-xs font-bold">UNSAVED</span>
              </div>
            )}
          </div>

          <div className="flex">
            <History
              versions={versions}
              setActiveVersionId={setActiveVersionId}
            />
            <Button
              size="sm"
              variant="light"
              isIconOnly
              onPress={() => setVariablesOpen(true)}
            >
              <LuBraces className="w-4 h-4" />
            </Button>
            <Button
              className="mx-2"
              isDisabled={saving}
              type="submit"
              size="sm"
              color="primary"
              startContent={<LuPlay />}
              endContent={
                <Kbd
                  className="text-xs bg-opacity-20 shadow-none text-default"
                  keys={["command", "enter"]}
                />
              }
            >
              Run
            </Button>
            <Deploy
              isDirty={formState.isDirty}
              activeVersionId={activeVersionId}
              versions={versions}
              setVersions={setVersions}
            />
          </div>
        </div>
        <div className="flex-1 flex overflow-y-hidden ">
          <div className="basis-2/5 h-full overflow-y-auto border-r p-4 space-y-4">
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
                        variableValues={variableValues}
                        openVariablesDialog={openVariablesDialog}
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
                        variableValues={variableValues}
                        openVariablesDialog={openVariablesDialog}
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
                        variableValues={variableValues}
                        openVariablesDialog={openVariablesDialog}
                      />
                    )}
                  />
                );
              }

              return null;
            })}
            <div className="flex">
              <Button
                variant="light"
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
                variant="light"
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
          <div className="basis-2/5 border-r p-4 space-y-4">
            <Response
              type={getValues().response_format.type}
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
          <div className="basis-1/5 w-56 p-3 flex flex-col gap-4">
            <Params control={control} />
          </div>
        </div>
      </form>
      <VariablesDialog
        isOpen={variablesOpen}
        onOpenChange={setVariablesOpen}
        getFormValues={getValues}
        values={variableValues}
        setValues={setVariableValues}
        onRun={() => handleSubmit(save)()}
      />
    </div>
  );
}
