import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Card,
  CardBody,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Kbd,
} from "@heroui/react";
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
} from "react-hook-form";
import {
  LuBraces,
  LuCornerUpLeft,
  LuPlay,
  LuPlus,
  LuSave,
} from "react-icons/lu";
import { z } from "zod";
import SystemMessage, {
  SystemMessageSchema,
} from "./components/system-message";
import UserMessage, { UserMessageSchema } from "./components/user-message";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import supabase from "utils/supabase";
import toast from "react-hot-toast";
import OpenAI from "openai";

import useWorkspacesStore from "stores/workspaces";

import Response from "./components/response";
import { stream } from "fetch-event-stream";
import AssistantMessage, {
  AssistantMessageSchema,
} from "./components/assistant-message";
import { useHotkeys } from "react-hotkeys-hook";
import VariablesDialog from "./components/variables-dialog";
import Params from "./components/params";
import { generatePromptName } from "utils/prompt";
import Deploy from "./components/deploy";
import { Version } from "./route";
import { ToolSchema } from "./components/tool";
import Tools from "./components/tools";
import { Database } from "supabase/functions/types";
import { deepEqual, hasAllVariables } from "utils/variables";

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
  tools: z.union([z.array(ToolSchema).min(1), z.undefined()]),
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
  parallel_tool_calls: z.boolean().default(false).optional(),
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
  tools: undefined,
  tool_choice: "auto",
  parallel_tool_calls: true,
};

export default function Prompt({
  name,
  setName,
  versions,
  activeVersionId,
  setVersions,
  setActiveVersionId,
  setDirty,
}: {
  name: string;
  setName: (name: string) => void;
  versions: Version[];
  activeVersionId: string | null;
  setVersions: Dispatch<SetStateAction<Version[]>>;
  setActiveVersionId: (activeVersionId: string | null) => void;
  setDirty: (dirty: boolean) => void;
}) {
  const { promptId } = useParams<{ promptId: string }>();
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspacesStore();

  const [saving, setSaving] = useState(false);
  const [response, setResponse] = useState<
    z.infer<typeof AssistantMessageSchema>
  >({
    role: "assistant",
    content: null,
    tool_calls: null,
  });
  const [variablesOpen, setVariablesOpen] = useState(false);
  const [variableValues, setVariableValues] = useState<Map<string, string>>(
    new Map()
  );
  const [evaluations, setEvaluations] = useState<
    Database["public"]["Tables"]["evaluations"]["Row"][]
  >([]);

  const activeVersion = useMemo(() => {
    return versions.find((v) => v.id === activeVersionId) || null;
  }, [activeVersionId, versions]);

  const methods = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      ...defaultValues,
      provider_id: activeVersion?.provider_id || "",
      ...(activeVersion?.params as object),
    } as FormValues,
  });

  useEffect(() => {
    const loadEvaluations = async () => {
      try {
        if (!activeVersionId) {
          return;
        }

        const { data, error } = await supabase
          .from("evaluations")
          .select("*")
          .eq("version_id", activeVersionId)
          .order("created_at", { ascending: true });

        if (error) {
          throw error;
        }

        setEvaluations(data);

        if (variableValues.size === 0 && data.length > 0) {
          const lastUpdated = data.sort((a, b) => {
            return (
              new Date(b.updated_at).getTime() -
              new Date(a.updated_at).getTime()
            );
          })[0];

          setVariableValues(
            new Map(Object.entries(lastUpdated.variables as object)) as Map<
              string,
              string
            >
          );
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadEvaluations();
  }, [activeVersionId, variableValues.size]);

  useEffect(() => {
    setDirty(methods.formState.isDirty);
  }, [methods.formState.isDirty, setDirty]);

  useEffect(() => {
    if (activeVersion !== null) {
      const params = activeVersion.params as object;

      methods.reset({
        provider_id: activeVersion.provider_id,

        ...params,
      } as FormValues);
    }
  }, [activeVersion, methods]);

  const updateEvaluations = useCallback(
    async (
      variables: Map<string, string>,
      response: z.infer<typeof AssistantMessageSchema>
    ) => {
      try {
        if (!activeVersionId) {
          throw new Error("No active version id");
        }

        const existingEvaluation = evaluations.find((e) =>
          deepEqual(e.variables, Object.fromEntries(variables))
        );

        if (methods.formState.isDirty) {
          if (existingEvaluation) {
            setEvaluations((prev) =>
              prev.map((e) =>
                e.id === existingEvaluation.id
                  ? { ...e, id: `create_${e.id}`, response }
                  : e
              )
            );
          } else {
            setEvaluations((prev) => [
              ...prev,
              {
                id: `create_${crypto.randomUUID()}`,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                version_id: activeVersionId,
                variables: Object.fromEntries(variables),
                response,
              },
            ]);
          }
        } else {
          if (existingEvaluation) {
            const { data, error } = await supabase
              .from("evaluations")
              .update({
                response,
                updated_at: new Date().toISOString(),
              })
              .eq("id", existingEvaluation.id)
              .select()
              .single();

            if (error) {
              throw error;
            }

            setEvaluations((prev) =>
              prev.map((e) => (e.id === existingEvaluation.id ? data : e))
            );
          } else {
            const { data, error } = await supabase
              .from("evaluations")
              .insert({
                version_id: activeVersionId,
                variables: Object.fromEntries(variables),
                response,
              })
              .select()
              .single();

            if (error) {
              throw error;
            }

            setEvaluations((prev) => [...prev, data]);
          }
        }
      } catch (error) {
        console.error(error);
      }
    },
    [activeVersionId, evaluations, methods.formState.isDirty]
  );

  const run = useCallback(
    async (values: FormValues) => {
      try {
        if (!promptId || !activeWorkspace) {
          return;
        }

        const provider_id = values.provider_id;

        const prompt = {
          messages: values.messages,
          tools: values.tools,
          tool_choice: values.tool_choice,
          parallel_tool_calls: values.parallel_tool_calls,
          model: values.model,
          max_tokens: values.max_tokens,
          temperature: values.temperature,
          response_format: values.response_format,
        };

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
              provider_id,
              workspace_id: activeWorkspace.id,
              prompt,
              stream: true,
              variables: Object.fromEntries(variableValues),
            }),
            headers: {
              Authorization: `Bearer ${
                import.meta.env.VITE_SUPABASE_ANON_KEY! || ""
              }`,
            },
          }
        );

        const responseCp: z.infer<typeof AssistantMessageSchema> = {
          role: "assistant",
          content: null,
          tool_calls: null,
        };

        for await (const event of events) {
          if (!event.data) {
            continue;
          }

          const data = JSON.parse(
            event.data
          ) as OpenAI.Chat.Completions.ChatCompletionChunk;

          if (data.choices.length === 0) {
            continue;
          }

          const delta = data.choices[0].delta;

          if (delta.content) {
            if (!responseCp.content) {
              responseCp.content = "";
            }

            responseCp.content += delta.content;
          }

          if (delta.tool_calls && delta.tool_calls.length > 0) {
            if (!responseCp.tool_calls) {
              responseCp.tool_calls = [];
            }

            delta.tool_calls.forEach((tc) => {
              const prevIndex = responseCp.tool_calls?.findIndex(
                (t) => t.index === tc.index
              );

              if (prevIndex === -1 || prevIndex === undefined) {
                responseCp.tool_calls?.push({
                  index: tc.index,
                  id: tc.id ?? "",
                  type: tc.type ?? "function",
                  function: {
                    name: tc.function?.name ?? "",
                    arguments: tc.function?.arguments ?? "",
                  },
                });
              } else {
                responseCp.tool_calls![prevIndex].function.arguments +=
                  tc.function?.arguments ?? "";
              }
            });
          }

          setResponse({ ...responseCp });
        }

        await updateEvaluations(variableValues, responseCp);
      } catch (error) {
        console.error(error);
        toast.error("Oops! Something went wrong.");
      } finally {
        setSaving(false);
      }
    },
    [promptId, activeWorkspace, variableValues, updateEvaluations]
  );

  const save = useCallback(
    async (values: FormValues) => {
      try {
        if (!promptId || !activeWorkspace) {
          return;
        }

        setSaving(true);

        let promptIdToBeUsed: string = promptId;

        if (methods.formState.isDirty) {
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
                  values.tools && values.tools.length > 0
                    ? values.tools
                    : undefined,
                tool_choice: values.tool_choice,
                parallel_tool_calls: values.parallel_tool_calls,
                model: values.model,
                max_tokens: values.max_tokens,
                temperature: values.temperature,
                response_format: values.response_format,
              },
            })
            .select()
            .single();

          if (error) {
            throw error;
          }

          const variables = Array.from(variableValues.keys());

          for (const evaluation of evaluations) {
            if (!hasAllVariables(evaluation.variables, variables)) {
              continue;
            }

            await supabase.from("evaluations").insert({
              version_id: data.id,
              variables: evaluation.variables,
              response: evaluation.id.includes("create_")
                ? evaluation.response
                : null,
            });
          }

          setVersions([data, ...versions]);
          setActiveVersionId(data.id);

          methods.reset(values);

          if (promptId === "create") {
            navigate(`/${activeWorkspace.slug}/prompts/${promptIdToBeUsed}`);

            return;
          }
        }
      } catch (error) {
        console.error(error);
        toast.error("Oops! Something went wrong.");
      } finally {
        setSaving(false);
      }
    },
    [
      promptId,
      activeWorkspace,
      methods,
      versions,
      variableValues,
      evaluations,
      setVersions,
      setActiveVersionId,
      name,
      setName,
      navigate,
    ]
  );

  const openVariablesDialog = useCallback(() => {
    setVariablesOpen(true);
  }, []);

  useHotkeys("mod+enter", () => methods.handleSubmit(save)(), [save]);

  const {
    fields: messages,
    append: addMessage,
    remove: removeMessage,
  } = useFieldArray({
    name: "messages",
    control: methods.control,
  });

  if (!promptId) {
    // TODO: Redirect to the prompts page
    return null;
  }

  return (
    <FormProvider {...methods}>
      <form
        className="flex-1 overflow-hidden"
        onSubmit={methods.handleSubmit(save, console.error)}
      >
        <div className="flex h-full overflow-hidden">
          <div className="basis-2/5 h-full overflow-y-auto border-r">
            <div className="p-4 space-y-4 flex flex-col overflow-y-auto">
              <Tools />

              {messages.map((field, index) => {
                if (field.role === "system") {
                  return (
                    <Controller
                      key={index}
                      name={`messages.${index}`}
                      control={methods.control}
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
                      control={methods.control}
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
                      control={methods.control}
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

            <div className="sticky bottom-0 bg-background z-10 flex items-center gap-2 p-4 border-t">
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    variant="flat"
                    size="sm"
                    startContent={<LuPlus className="size-4" />}
                  >
                    Message
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem
                    key="user"
                    onPress={() =>
                      addMessage({
                        role: "user",
                        content: [{ type: "text", text: "" }],
                      })
                    }
                  >
                    User
                  </DropdownItem>
                  <DropdownItem
                    key="assistant"
                    onPress={() =>
                      addMessage({ role: "assistant", content: "" })
                    }
                  >
                    Assistant
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
              <Button
                size="sm"
                variant="flat"
                onPress={() => setVariablesOpen(true)}
                startContent={<LuBraces className="w-4 h-4" />}
              >
                Variables
              </Button>
            </div>
          </div>
          <div className="basis-2/5 h-full overflow-y-auto border-r p-4 space-y-4">
            <Card>
              <CardBody className="gap-4">
                <Chip size="sm" variant="flat" color="secondary">
                  RESPONSE
                </Chip>
                <Response
                  type={methods.getValues().response_format.type}
                  value={response}
                />
              </CardBody>
            </Card>
            <div className="flex justify-between">
              <div>
                {((response.content && response.content.length > 0) ||
                  (response.tool_calls && response.tool_calls.length > 0)) && (
                  <Button
                    size="sm"
                    variant="flat"
                    startContent={<LuCornerUpLeft />}
                    onPress={() => {
                      addMessage(response);
                      setResponse({
                        role: "assistant",
                        content: null,
                        tool_calls: null,
                      });
                    }}
                  >
                    Add to conversation
                  </Button>
                )}
              </div>

              <Button
                isDisabled={saving}
                onPress={() => methods.handleSubmit(run, console.error)()}
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
            </div>
          </div>
          <div className="basis-1/5 w-56 p-3 flex flex-col gap-4">
            <Params />
          </div>
        </div>
      </form>
      <VariablesDialog
        isOpen={variablesOpen}
        onOpenChange={setVariablesOpen}
        getFormValues={methods.getValues}
        values={variableValues}
        setValues={setVariableValues}
        onRun={() => methods.handleSubmit(run)()}
      />
      <div className="flex items-center absolute right-3 top-0 h-12">
        <Button
          className="mx-2"
          color="primary"
          size="sm"
          isDisabled={!methods.formState.isDirty}
          isLoading={saving}
          startContent={<LuSave />}
          onPress={() => methods.handleSubmit(save)()}
        >
          Save
        </Button>

        <Deploy
          isDirty={methods.formState.isDirty}
          activeVersionId={activeVersionId}
          versions={versions}
          setVersions={setVersions}
        />
      </div>
    </FormProvider>
  );
}
