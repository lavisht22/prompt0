/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
  useDisclosure,
  Spinner,
  Alert,
  Textarea,
} from "@nextui-org/react";
import { Version } from "./route";
import { useMemo, useCallback, useState, useEffect } from "react";
import supabase from "utils/supabase";
import { Json } from "supabase/functions/types";
import toast from "react-hot-toast";
import { LuPlay, LuPlus, LuTrash2 } from "react-icons/lu";
import AddVariablesDialog from "./components/add-variables-dialog";
import Response from "./components/response";
import { z } from "zod";
import { extractVaraiblesFromMessages } from "utils/variables";
import { FormValues } from "routes/$worskpaceSlug.prompts.$id/prompt";
import { AssistantMessageSchema } from "./components/assistant-message";
import { stream } from "fetch-event-stream";
import useWorkspacesStore from "stores/workspaces";
import OpenAI from "openai";
type Evaluation = {
  id: string;
  version_id: string;
  variables: { [key: string]: string };
  response: z.infer<typeof AssistantMessageSchema> | null;
  created_at: string;
};

export default function Evaluate({
  versions,
  activeVersionId,
}: {
  activeVersionId: string | null;
  versions: Version[];
}) {
  const { activeWorkspace } = useWorkspacesStore();

  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [runningRows, setRunningRows] = useState<Set<string>>(new Set());
  const [runningAll, setRunningAll] = useState(false);
  const { isOpen, onOpenChange } = useDisclosure();

  const activeVersion = useMemo(() => {
    return versions.find((v) => v.id === activeVersionId) || null;
  }, [activeVersionId, versions]);

  useEffect(() => {
    if (!activeVersionId) return;

    const fetchEvaluations = async () => {
      try {
        const { data, error } = await supabase
          .from("evaluations")
          .select("*")
          .eq("version_id", activeVersionId)
          .order("created_at", { ascending: true });

        if (error) {
          throw error;
        }

        setEvaluations(data as Evaluation[]);
      } catch {
        toast.error("Unable to fetch evaluations");
      }
    };

    fetchEvaluations();
  }, [activeVersionId]);

  const params = useMemo(() => {
    return activeVersion?.params as unknown as {
      messages: FormValues["messages"];
    };
  }, [activeVersion]);

  const columns = useMemo(() => {
    const allVariables = extractVaraiblesFromMessages(params.messages);

    return [
      ...allVariables.map((variable) => ({
        key: variable,
        label: `{{${variable}}}`,
      })),
    ];
  }, [params.messages]);

  const rows = useMemo(
    () =>
      evaluations.map((evaluation) => ({
        key: evaluation.id,
        ...evaluation.variables,
        response: evaluation.response || null,
        actions: null,
      })),
    [evaluations]
  );

  const updateEvaluation = useCallback(
    async (id: string, response: unknown) => {
      try {
        const { error } = await supabase
          .from("evaluations")
          .update({
            response: response as Json,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (error) {
          throw error;
        }
      } catch {
        toast.error(
          "Oops! Something went wrong while updating the evaluation."
        );
      }
    },
    []
  );

  const handleRunSingle = useCallback(
    async (id: string) => {
      if (!activeVersion || !activeWorkspace) return;

      try {
        setRunningRows((prev) => new Set([...prev, id]));
        const evaluation = evaluations.find((e) => e.id === id);

        if (!evaluation) {
          throw new Error("Evaluation not found");
        }

        const events = await stream(
          "https://glzragfkzcvgpipkgyrq.supabase.co/functions/v1/run",
          {
            method: "POST",
            body: JSON.stringify({
              provider_id: activeVersion.provider_id,
              workspace_id: activeWorkspace.id,
              prompt: activeVersion.params,
              stream: true,
              variables: evaluation.variables,
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

          setEvaluations((prev) =>
            prev.map((e) => (e.id === id ? { ...e, response: responseCp } : e))
          );
        }

        await updateEvaluation(id, responseCp);
      } catch (error) {
        console.error("Error running evaluation:", error);
        toast.error("Oops! Something went wrong while running the evaluation.");
      } finally {
        setRunningRows((prev) => {
          prev.delete(id);
          return prev;
        });
      }
    },
    [activeVersion, activeWorkspace, evaluations, updateEvaluation]
  );

  const handleDeleteRow = useCallback(
    async (id: string) => {
      if (!activeVersion) return;

      try {
        const { error } = await supabase
          .from("evaluations")
          .delete()
          .eq("id", id);

        if (error) {
          throw error;
        }

        setEvaluations((prev) => prev.filter((e) => e.id !== id));
      } catch {
        toast.error("Failed to delete evaluation");
      }
    },
    [activeVersion]
  );

  const handleAddRow = useCallback(
    async (values: Record<string, string>) => {
      if (!activeVersion) return;

      const { data, error } = await supabase
        .from("evaluations")
        .insert({
          version_id: activeVersion.id,
          variables: values,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setEvaluations((prev) => [...prev, data as Evaluation]);
    },
    [activeVersion]
  );

  const handleRunRemaining = useCallback(async () => {
    try {
      setRunningAll(true);
      const pendingEvaluations = evaluations.filter(
        (e) => e.response === null && !runningRows.has(e.id)
      );

      await Promise.all(
        pendingEvaluations.map(async (evaluation) => {
          await handleRunSingle(evaluation.id);
        })
      );
    } catch {
      toast.error("Oops! Something went wrong while running the evaluations.");
    } finally {
      setRunningAll(false);
    }
  }, [evaluations, handleRunSingle, runningRows]);

  return (
    <>
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="px-4 pt-4">
          {columns.length === 0 && (
            <Alert
              color="warning"
              title={`You have not added any variables to this prompt`}
            />
          )}
        </div>
        <div className="flex-1 overflow-y-auto relative">
          <Table
            aria-label="Evaluations table"
            radius="none"
            shadow="none"
            bottomContent={
              <div className="flex items-center">
                <Button
                  size="sm"
                  startContent={<LuPlus />}
                  onPress={onOpenChange}
                >
                  Add Row
                </Button>
              </div>
            }
          >
            <TableHeader>
              {
                columns.map((column) => (
                  <TableColumn key={column.key} width={150}>
                    {column.label}
                  </TableColumn>
                )) as any
              }
              <TableColumn key="response">Response</TableColumn>
              <TableColumn width={10} key="actions">
                Actions
              </TableColumn>
            </TableHeader>
            <TableBody items={rows}>
              {rows.map((row) => (
                <TableRow>
                  {
                    columns.map((column) => (
                      <TableCell key={column.key} width={250}>
                        <Textarea
                          readOnly
                          value={getKeyValue(row, column.key)}
                          minRows={1}
                          maxRows={10}
                        />
                      </TableCell>
                    )) as any
                  }

                  <TableCell key="response">
                    {runningRows.has(row.key) && row.response === null ? (
                      <Spinner size="sm" />
                    ) : row.response === null ? (
                      <Button
                        size="sm"
                        startContent={<LuPlay />}
                        onPress={() => handleRunSingle(row.key)}
                        isDisabled={runningRows.has(row.key)}
                      >
                        Run
                      </Button>
                    ) : (
                      <Response
                        type="text"
                        value={
                          row.response as z.infer<typeof AssistantMessageSchema>
                        }
                        maxRows={10}
                      />
                    )}
                  </TableCell>

                  <TableCell key="actions" width={10} className="text-center">
                    <Button
                      color="danger"
                      variant="light"
                      size="sm"
                      isIconOnly
                      onPress={() => handleDeleteRow(row.key)}
                      isDisabled={runningRows.has(row.key)}
                    >
                      <LuTrash2 />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="flex items-center absolute right-3 top-0 h-12">
        <Button
          className="ml-2"
          size="sm"
          color="primary"
          startContent={<LuPlay />}
          onPress={handleRunRemaining}
          isLoading={runningAll}
        >
          Run Remaining
        </Button>
      </div>
      <AddVariablesDialog
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        variables={columns
          .filter((c) => c.key !== "actions" && c.key !== "response")
          .map((c) => c.key)}
        onAdd={handleAddRow}
      />
    </>
  );
}
