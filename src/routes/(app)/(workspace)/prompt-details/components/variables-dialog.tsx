import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Textarea,
} from "@nextui-org/react";
import { LuPlay } from "react-icons/lu";
import { FormValues } from "../page";
import { useEffect, useState } from "react";
import { extractVariables } from "utils/variables";

export default function VariablesDialog({
  isOpen,
  onOpenChange,
  values,
  setValues,
  getFormValues,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  values: Map<string, string>;
  setValues: (values: Map<string, string>) => void;
  getFormValues: () => FormValues;
}) {
  const [variables, setVariables] = useState<string[]>([]);

  useEffect(() => {
    const arr: string[] = [];

    getFormValues().messages.forEach((message) => {
      if (message.role === "system" || message.role === "assistant") {
        arr.push(...extractVariables(message.content || ""));
      }

      if (message.role === "user") {
        message.content.forEach((part) => {
          if (part.type === "text") {
            arr.push(...extractVariables(part.text));
          }

          if (part.type === "image_url") {
            arr.push(...extractVariables(part.image_url.url));
          }
        });
      }
    });

    setVariables([...arr]);
  }, [getFormValues, isOpen]);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} scrollBehavior="inside">
      <ModalContent>
        <ModalHeader>Variables</ModalHeader>
        <ModalBody className="flex flex-col gap-4">
          {variables.map((variable) => {
            const value = values.get(variable);

            return (
              <div key={variable}>
                <Textarea
                  isInvalid={value === undefined || value.length === 0}
                  label={`{{${variable}}}`}
                  labelPlacement="outside"
                  minRows={1}
                  maxRows={5}
                  value={value}
                  onChange={(e) => {
                    setValues(new Map(values.set(variable, e.target.value)));
                  }}
                />
              </div>
            );
          })}
        </ModalBody>
        <ModalFooter>
          <Button fullWidth color="primary" startContent={<LuPlay />}>
            Run
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
