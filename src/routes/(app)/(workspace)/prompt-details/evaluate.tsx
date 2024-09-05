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
import { Version } from "./page";
import {
  useMemo,
  useCallback,
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
} from "react";
import { stream } from "fetch-event-stream";
import supabase from "utils/supabase";
import { Json } from "supabase/functions/types";
import toast from "react-hot-toast";
import { addEvaluation } from "utils/evaluations";
import { LuPlay, LuPlus, LuTrash2 } from "react-icons/lu";
import AddVariablesDialog from "./components/add-variables-dialog";
export default function Evaluate({
  activeVersionId,
  versions,
  setVersions,
}: {
  activeVersionId: string | null;
  versions: Version[];
  setVersions: Dispatch<SetStateAction<Version[]>>;
}) {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [runningRowIndex, setRunningRowIndex] = useState<number | null>(null);
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

  const handleRunEvaluation = useCallback(
    async (rowIndex: number) => {
      if (!activeVersion) return;

      setRunningRowIndex(rowIndex);

      const evaluation = evaluations[rowIndex];
      const variables = new Map(Object.entries(evaluation.variables));

      try {
        const response = await stream(
          "https://glzragfkzcvgpipkgyrq.supabase.co/functions/v1/run",
          {
            method: "POST",
            body: JSON.stringify({
              prompt_id: activeVersion.prompt_id,
              version_id: activeVersion.id,
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

        let responseText = "";

        for await (const event of response) {
          if (!event.data) {
            continue;
          }

          const data = JSON.parse(event.data) as {
            delta: {
              content: string | null;
            };
          };

          responseText += data.delta.content || "";

          // Update the state immediately for each chunk
          setEvaluations((prevEvaluations) => {
            const updatedEvaluations = [...prevEvaluations];
            updatedEvaluations[rowIndex] = {
              ...updatedEvaluations[rowIndex],
              response: responseText,
            };
            return updatedEvaluations;
          });
        }

        // Update the database after streaming is complete
        const updatedEvaluations = addEvaluation(evaluations, {
          variables: evaluation.variables,
          response: responseText,
          created_at: new Date().toISOString(),
        });

        // Update the database
        const { data, error } = await supabase
          .from("versions")
          .update({
            evaluations: updatedEvaluations as unknown as Json,
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
        console.error("Error running evaluation:", error);
        toast.error("Oops! Something went wrong while running the evaluation.");
      } finally {
        setRunningRowIndex(null);
      }
    },
    [activeVersion, evaluations, setVersions]
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

      const evaluationsCp = [...evaluations];
      const updatedEvaluations = addEvaluation(evaluations, {
        variables: values,
        response: null,
        created_at: new Date().toISOString(),
      });

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
        toast.error("Failed to add row");
        setEvaluations(evaluationsCp);
      }
    },
    [evaluations, activeVersion, setVersions]
  );

  const handleRunRemaining = useCallback(async () => {
    setRunningAll(true);
    await Promise.all(
      evaluations.map((evaluation, index) => {
        if (evaluation.response === null) {
          return handleRunEvaluation(index);
        }
      })
    );
    setRunningAll(false);
  }, [evaluations, handleRunEvaluation]);

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
                          onClick={() => handleRunEvaluation(Number(item.key))}
                          isLoading={runningRowIndex === Number(item.key)}
                          isDisabled={
                            runningRowIndex !== null &&
                            runningRowIndex !== Number(item.key)
                          }
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
                        getKeyValue(item, columnKey) || "-"
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
        <Button
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
