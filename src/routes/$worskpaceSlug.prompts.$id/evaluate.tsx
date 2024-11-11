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
} from "@nextui-org/react";
import { Version } from "./route";
import {
  useMemo,
  useCallback,
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
} from "react";
import supabase from "utils/supabase";
import { Json } from "supabase/functions/types";
import toast from "react-hot-toast";
import { LuPlay, LuPlus, LuTrash2 } from "react-icons/lu";
import AddVariablesDialog from "./components/add-variables-dialog";
import History from "./components/history";
import { Evaluation } from "./types";
import Response from "./components/response";
import { z } from "zod";
import { AssistantMessageSchema } from "./components/assistant-message";

export default function Evaluate({
  activeVersionId,
  versions,
  setVersions,
  setActiveVersionId,
}: {
  activeVersionId: string | null;
  setActiveVersionId: Dispatch<SetStateAction<string | null>>;
  versions: Version[];
  setVersions: Dispatch<SetStateAction<Version[]>>;
}) {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [runningRowIndexes, setRunningRowIndexes] = useState<Set<number>>(
    new Set()
  );
  const [runningAll, setRunningAll] = useState(false);
  const { isOpen, onOpenChange } = useDisclosure();

  const activeVersion = useMemo(() => {
    return versions.find((v) => v.id === activeVersionId) || null;
  }, [activeVersionId, versions]);

  useEffect(() => {
    if (activeVersion) {
      setEvaluations(activeVersion.evaluations as unknown as Evaluation[]);
    }
  }, [activeVersion]);

  const columns = useMemo(() => {
    const allVariables = new Set<string>();

    evaluations.forEach((evaluation) => {
      Object.keys(evaluation.variables).forEach((key) => allVariables.add(key));
    });

    return [
      ...Array.from(allVariables).map((variable) => ({
        key: variable,
        label: `{{${variable}}}`,
      })),
      { key: "response", label: "Response" },
      { key: "actions", label: "Actions" }, // New column
    ];
  }, [evaluations]);

  const rows = useMemo(
    () =>
      evaluations.map((evaluation, index) => ({
        key: index.toString(),
        ...evaluation.variables,
        response: evaluation.response || null, // Change '-' to null
        actions: null, // Add this line for the new column
      })),
    [evaluations]
  );

  const evaluate = useCallback(
    async (variables: { [key: string]: string }) => {
      if (!activeVersion) {
        throw new Error("No active version");
      }

      const response = await fetch(
        "https://glzragfkzcvgpipkgyrq.supabase.co/functions/v1/run",
        {
          method: "POST",
          body: JSON.stringify({
            prompt_id: activeVersion.prompt_id,
            version_id: activeVersion.id,
            stream: false,
            variables,
          }),
          headers: {
            Authorization: `Bearer ${
              import.meta.env.VITE_SUPABASE_ANON_KEY! || ""
            }`,
          },
        }
      ).then((res) => res.json());

      return response.message;
    },
    [activeVersion]
  );

  const updateVersion = useCallback(
    async (newEvaluations: Evaluation[]) => {
      try {
        if (!activeVersion) return;

        const { data, error } = await supabase
          .from("versions")
          .update({
            evaluations: newEvaluations as unknown as Json,
          })
          .eq("id", activeVersion.id)
          .select()
          .single();

        if (error) {
          throw error;
        }

        setVersions((prev) =>
          prev.map((v) => (v.id === activeVersion.id ? data : v))
        );
      } catch (error) {
        console.error("Error updating version:", error);
        toast.error("Oops! Something went wrong while updating the version.");
      }
    },
    [activeVersion, setVersions]
  );

  const handleRunSingle = useCallback(
    async (rowIndex: number) => {
      if (!activeVersion) return;

      try {
        const evaluation = evaluations[rowIndex];

        setRunningRowIndexes((prev) => new Set([...prev, rowIndex]));

        const response = await evaluate(evaluation.variables);

        const updatedEvaluations = evaluations.map((e, i) =>
          i === rowIndex ? { ...e, response } : e
        );

        setEvaluations(updatedEvaluations);

        await updateVersion(updatedEvaluations);
      } catch (error) {
        console.error("Error running evaluation:", error);
        toast.error("Oops! Something went wrong while running the evaluation.");
      } finally {
        setRunningRowIndexes((prev) => {
          prev.delete(rowIndex);
          return prev;
        });
      }
    },
    [activeVersion, evaluate, evaluations, updateVersion]
  );

  const handleDeleteEvaluation = useCallback(
    async (index: number) => {
      if (!activeVersion) return;

      const evaluationsCp = [...evaluations];
      const updatedEvaluations = evaluations.filter((_, i) => i !== index);
      setEvaluations(updatedEvaluations);

      try {
        const { data, error } = await supabase
          .from("versions")
          .update({ evaluations: updatedEvaluations as unknown as Json })
          .eq("id", activeVersion.id)
          .select()
          .single();

        if (error) {
          throw error;
        }

        setVersions((prev) =>
          prev.map((v) => (v.id === activeVersion.id ? data : v))
        );
      } catch {
        toast.error("Failed to delete evaluation");
        setEvaluations(evaluationsCp);
      }
    },
    [activeVersion, evaluations, setVersions]
  );

  const handleAddRow = useCallback(
    async (values: Record<string, string>) => {
      if (!activeVersion) return;

      const updatedEvaluations = [
        ...evaluations,
        {
          variables: values,
          response: null,
          created_at: new Date().toISOString(),
        },
      ];

      setEvaluations(updatedEvaluations);

      await updateVersion(updatedEvaluations);
    },
    [activeVersion, evaluations, updateVersion]
  );

  const handleRunRemaining = useCallback(async () => {
    try {
      setRunningAll(true);

      const updatedEvaluations = await Promise.all(
        evaluations.map(async (evaluation, index) => {
          if (evaluation.response === null) {
            setRunningRowIndexes((prev) => new Set([...prev, index]));
            const response = await evaluate(evaluation.variables);
            setRunningRowIndexes((prev) => {
              prev.delete(index);
              return prev;
            });

            setEvaluations((prev) =>
              prev.map((e, i) => (i === index ? { ...e, response } : e))
            );

            return {
              ...evaluation,
              response,
            };
          }

          return evaluation;
        })
      );

      setEvaluations(updatedEvaluations);

      await updateVersion(updatedEvaluations);
    } catch (error) {
      console.error("Error running all evaluations:", error);
      toast.error("Oops! Something went wrong while running the evaluations.");
    } finally {
      setRunningAll(false);
    }
  }, [evaluate, evaluations, updateVersion]);

  return (
    <>
      <div className="flex-1 overflow-hidden flex flex-col ">
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
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn key={column.key}>{column.label}</TableColumn>
              )}
            </TableHeader>
            <TableBody items={rows}>
              {(item) => (
                <TableRow key={item.key} className="border-b">
                  {(columnKey) => (
                    <TableCell>
                      {columnKey === "response" && item[columnKey] === null ? (
                        <Button
                          size="sm"
                          startContent={<LuPlay />}
                          onClick={() => handleRunSingle(Number(item.key))}
                          isLoading={runningRowIndexes.has(Number(item.key))}
                        >
                          Run
                        </Button>
                      ) : columnKey === "actions" ? (
                        <Button
                          color="danger"
                          variant="light"
                          size="sm"
                          isIconOnly
                          onClick={() =>
                            handleDeleteEvaluation(Number(item.key))
                          }
                        >
                          <LuTrash2 />
                        </Button>
                      ) : (
                        <>
                          {columnKey === "response" ? (
                            <div className="space-y-2">
                              <Response
                                type="text"
                                value={
                                  item.response as z.infer<
                                    typeof AssistantMessageSchema
                                  >
                                }
                              />
                            </div>
                          ) : (
                            getKeyValue(item, columnKey)
                          )}
                        </>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="flex items-center absolute right-3 top-0 h-12">
        <History versions={versions} setActiveVersionId={setActiveVersionId} />
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
