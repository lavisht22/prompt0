import {
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
} from "@nextui-org/react";
import { Version } from "./page";
import { useMemo } from "react";

interface Evaluation {
  variables: Record<string, string>;
  response: string | null;
}

export default function Evaluate({
  activeVersion,
  dirty,
}: {
  activeVersion: Version | null;
  dirty: boolean;
}) {
  const evaluations = useMemo(
    () => (activeVersion?.evaluations as unknown as Evaluation[]) || [],
    [activeVersion]
  );

  const columns = useMemo(() => {
    const allVariables = new Set<string>();
    evaluations.forEach((evaluation) => {
      Object.keys(evaluation.variables).forEach((key) => allVariables.add(key));
    });
    return [
      ...Array.from(allVariables).map((variable) => ({
        key: variable,
        label: variable,
      })),
      { key: "response", label: "Response" },
    ];
  }, [evaluations]);

  const rows = useMemo(
    () =>
      evaluations.map((evaluation, index) => ({
        key: index.toString(),
        ...evaluation.variables,
        response: evaluation.response || "-",
      })),
    [evaluations]
  );

  return (
    <>
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="overflow-y-auto">
          <Table aria-label="Evaluations table" radius="none" shadow="none">
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn key={column.key}>{column.label}</TableColumn>
              )}
            </TableHeader>
            <TableBody items={rows}>
              {(item) => (
                <TableRow key={item.key}>
                  {(columnKey) => (
                    <TableCell>{getKeyValue(item, columnKey)}</TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="flex items-center absolute right-3 top-0 h-12">
        <Button size="sm" color="primary">
          Run all
        </Button>
      </div>
    </>
  );
}
