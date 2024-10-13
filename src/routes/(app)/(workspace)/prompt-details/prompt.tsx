import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Kbd } from "@nextui-org/react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { LuBraces, LuPlay, LuPlus } from "react-icons/lu";
import { z } from "zod";
import SystemMessage, {
  SystemMessageSchema,
} from "./components/system-message";
import UserMessage, { UserMessageSchema } from "./components/user-message";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import supabase from "utils/supabase";
import toast from "react-hot-toast";

import useWorkspacesStore from "stores/workspaces";

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
import { Version } from "./page";
import { addEvaluation, copyEvaluations } from "utils/evaluations";
import { Json } from "supabase/functions/types";
import Tool, { ToolSchema } from "./components/tool";
import { ToolDialog } from "./components/tool-dialog";
import { Evaluation } from "./types";

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
  tools: z.array(ToolSchema).min(1).optional(),
  tool_choice: z
    .union([
      z.literal("none"),
      z.literal("auto"),
      z.literal("required"),
      z.object({
        type: z.literal("function"),
        function: z.object({ name: z.string() }),
      }),
    ])
    .optional(),
  parallel_tool_calls: z.boolean().optional().default(true),
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
  tools: [],
  tool_choice: "auto",
  parallel_tool_calls: true,
};

export default function Prompt({
  versions,
  activeVersionId,
  setVersions,
  setActiveVersionId,
  setDirty,
}: {
  versions: Version[];
  activeVersionId: string | null;
  setVersions: (versions: Version[]) => void;
  setActiveVersionId: (activeVersionId: string | null) => void;
  setDirty: (dirty: boolean) => void;
}) {
  const { promptId } = useParams<{ promptId: string }>();
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspacesStore();

  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [response, setResponse] = useState<
    z.infer<typeof AssistantMessageSchema>
  >({
    role: "assistant",
    content: null,
    tool_calls: null,
  });
  const [variablesOpen, setVariablesOpen] = useState(false);
  const [addToolOpen, setAddToolOpen] = useState(false);
  const [variableValues, setVariableValues] = useState<Map<string, string>>(
    new Map()
  );

  const activeVersion = useMemo(() => {
    return versions.find((v) => v.id === activeVersionId) || null;
  }, [activeVersionId, versions]);

  const evaluations = useMemo(() => {
    return (activeVersion?.evaluations as unknown as Evaluation[]) || [];
  }, [activeVersion]);

  const { handleSubmit, control, reset, formState, getValues, setValue } =
    useForm<FormValues>({
      resolver: zodResolver(FormSchema),
      defaultValues: {
        ...defaultValues,
        provider_id: activeVersion?.provider_id || "",
        ...(activeVersion?.params as object),
      } as FormValues,
    });

  // Add this useWatch hook to listen for changes in the tools array
  const toolsWatch = useWatch({
    control,
    name: "tools",
  });

  // Add this useEffect to set tools to undefined when its length becomes 0
  useEffect(() => {
    if (toolsWatch && toolsWatch.length === 0) {
      setValue("tools", undefined);
    }
  }, [toolsWatch, setValue]);

  useEffect(() => {
    setDirty(formState.isDirty);
  }, [formState.isDirty, setDirty]);

  useEffect(() => {
    if (activeVersion !== null) {
      const params = activeVersion.params as object;

      reset({
        provider_id: activeVersion.provider_id,

        ...params,
      } as FormValues);
    }
  }, [activeVersion, reset]);

  useEffect(() => {
    const lastEvaluation = evaluations[evaluations.length - 1];

    if (lastEvaluation) {
      setVariableValues(new Map(Object.entries(lastEvaluation.variables)));
    }
  }, [evaluations]);

  const generate = useCallback(
    async (version: Version, variables: Map<string, string>) => {
      setResponse({
        role: "assistant",
        content: null,
        tool_calls: null,
      });

      const events = await stream(
        "https://glzragfkzcvgpipkgyrq.supabase.co/functions/v1/run",
        {
          method: "POST",
          body: JSON.stringify({
            prompt_id: version.prompt_id,
            version_id: version.id,
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

      for await (const event of events) {
        if (!event.data) {
          continue;
        }

        const data = JSON.parse(event.data) as {
          delta: {
            content: string | null;
            tool_calls: {
              index: number;
              id?: string;
              type?: "function";
              function: {
                name?: string;
                arguments: string;
              };
            }[];
          };
        };

        setResponse((prev) => {
          if (data.delta.content) {
            if (!prev.content) {
              prev.content = "";
            }

            prev.content += data.delta.content;
          }

          if (data.delta.tool_calls && data.delta.tool_calls.length > 0) {
            if (!prev.tool_calls) {
              prev.tool_calls = [];
            }

            data.delta.tool_calls.forEach((tc) => {
              const prevIndex = prev.tool_calls?.findIndex(
                (t) => t.index === tc.index
              );

              if (prevIndex === -1 || prevIndex === undefined) {
                prev.tool_calls?.push({
                  index: tc.index,
                  id: tc.id ?? "",
                  type: tc.type ?? "function",
                  function: {
                    name: tc.function.name ?? "",
                    arguments: tc.function.arguments,
                  },
                });
              } else {
                prev.tool_calls![prevIndex].function.arguments +=
                  tc.function.arguments;
              }
            });
          }

          return prev;
        });
      }

      const versionEvaluations = version.evaluations as unknown as Evaluation[];

      // Add to evaluations for this version
      const newEvaluations = addEvaluation(versionEvaluations, {
        variables: Object.fromEntries(variables),
        response,
        created_at: new Date().toISOString(),
      });

      await supabase
        .from("versions")
        .update({
          evaluations: newEvaluations as unknown as Json,
        })
        .eq("id", version.id)
        .throwOnError();
    },
    [response]
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

        let version: Version | null = activeVersion;

        let promptIdToBeUsed: string = promptId;
        let evaluationsToAdd: Evaluation[] = evaluations;

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

            promptIdToBeUsed = createdPrompt.id;
          }

          // Determine which evaluations to copy over from previous version
          const prevEvaluations = copyEvaluations(
            evaluations,
            cleanedVariables
          );

          evaluationsToAdd = addEvaluation(prevEvaluations, {
            variables: Object.fromEntries(cleanedVariables),
            response: {
              role: "assistant",
              content: null,
              tool_calls: null,
            },
            created_at: new Date().toISOString(),
          });

          const number = Math.max(...versions.map((v) => v.number), 0) + 1;

          const { data, error } = await supabase
            .from("versions")
            .insert({
              prompt_id: promptIdToBeUsed,
              provider_id: values.provider_id,
              number,
              params: {
                messages: values.messages,
                tools:
                  values.tools && values.tools.length > 0 ? values.tools : null,
                model: values.model,
                max_tokens: values.max_tokens,
                temperature: values.temperature,
                response_format: values.response_format,
              },
              evaluations: evaluationsToAdd as unknown as Json,
            })
            .select()
            .single();

          if (error) {
            throw error;
          }

          version = data;
          setVersions([data, ...versions]);
          setActiveVersionId(data.id);

          reset(values);

          if (promptId === "create") {
            navigate(`/${activeWorkspace.slug}/prompts/${version.prompt_id}`);

            return;
          }
        }

        if (version) {
          // Call the generate function
          await generate(version, cleanedVariables);
        }
      } catch (error) {
        console.error(error);
        toast.error("Oops! Something went wrong.");
      } finally {
        setSaving(false);
      }
    },
    [
      activeVersion,
      activeWorkspace,
      evaluations,
      formState.isDirty,
      generate,
      name,
      navigate,
      promptId,
      reset,
      setActiveVersionId,
      setVersions,
      variableValues,
      versions,
    ]
  );

  const openVariablesDialog = useCallback(() => {
    setVariablesOpen(true);
  }, []);

  useHotkeys("mod+enter", () => handleSubmit(save)(), [save]);

  const {
    fields: messages,
    append: addMessage,
    remove: removeMessage,
  } = useFieldArray({
    name: "messages",
    control,
  });

  const {
    fields: tools,
    append: addTool,
    remove: removeTool,
  } = useFieldArray({
    name: "tools",
    control,
  });

  if (!promptId) {
    // TODO: Redirect to the prompts page
    return null;
  }

  return (
    <>
      <form
        className="flex-1 overflow-hidden"
        onSubmit={handleSubmit(save, console.error)}
      >
        <div className="flex h-full overflow-hidden">
          <div className="basis-2/5 h-full overflow-y-auto border-r space-y-4">
            <div className="p-4 flex flex-col gap-4">
              <ToolDialog
                isOpen={addToolOpen}
                onOpenChange={setAddToolOpen}
                value={{
                  type: "function",
                  function: {
                    name: "function_name",
                    description: "description of the function",
                    strict: true,
                    parameters: {
                      type: "object",
                      properties: {
                        property_name: {
                          type: "string",
                          description: "description of this property",
                        },
                      },
                      additionalProperties: false,
                      required: [],
                    },
                  },
                }}
                onValueChange={(value) => addTool(value)}
              />
              {tools.map((_, index) => (
                <Controller
                  key={index}
                  name={`tools.${index}`}
                  control={control}
                  render={({ field, fieldState }) => (
                    <Tool
                      value={field.value as z.infer<typeof ToolSchema>}
                      onValueChange={field.onChange}
                      isInvalid={fieldState.invalid}
                      onRemove={() => removeTool(index)}
                    />
                  )}
                />
              ))}

              <Button
                variant="flat"
                size="sm"
                startContent={<LuPlus />}
                onPress={() => setAddToolOpen(true)}
              >
                Add Tool
              </Button>

              {messages.map((field, index) => {
                if (field.role === "system") {
                  return (
                    <Controller
                      key={index}
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
                      key={index}
                      name={`messages.${index}`}
                      control={control}
                      render={({ field, fieldState }) => (
                        <UserMessage
                          value={
                            field.value as z.infer<typeof UserMessageSchema>
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

                if (field.role === "assistant") {
                  return (
                    <Controller
                      key={index}
                      name={`messages.${index}`}
                      control={control}
                      render={({ field, fieldState }) => (
                        <AssistantMessage
                          value={
                            field.value as z.infer<
                              typeof AssistantMessageSchema
                            >
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
            </div>

            <div className="flex gap-2 sticky bottom-0 bg-background z-10 p-4 border-t">
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
          <div className="basis-2/5 h-full overflow-y-auto border-r p-4 space-y-4">
            <Response
              type={getValues().response_format.type}
              value={response}
              onAddToConversation={() => {
                addMessage(response);
                setResponse({
                  role: "assistant",
                  content: null,
                  tool_calls: null,
                });
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
      <div className="flex items-center absolute right-3 top-0 h-12">
        <History versions={versions} setActiveVersionId={setActiveVersionId} />
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
          onPress={() => handleSubmit(save, console.error)()}
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
    </>
  );
}
