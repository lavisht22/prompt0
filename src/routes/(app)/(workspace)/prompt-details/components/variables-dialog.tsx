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
import { extractVaraiblesFromMessages } from "utils/variables";

export default function VariablesDialog({
  isOpen,
  onOpenChange,
  values,
  setValues,
  getFormValues,
  onRun,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  values: Map<string, string>;
  setValues: (values: Map<string, string>) => void;
  getFormValues: () => FormValues;
  onRun: () => void;
}) {
  const [variables, setVariables] = useState<string[]>([]);

  useEffect(() => {
    setVariables(extractVaraiblesFromMessages(getFormValues().messages));
  }, [getFormValues, isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      scrollBehavior="inside"
      backdrop="blur"
    >
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
          <Button
            isDisabled={variables.some((variable) => {
              const value = values.get(variable);
              return value === undefined || value.length === 0;
            })}
            fullWidth
            color="primary"
            startContent={<LuPlay />}
            onPress={() => {
              onOpenChange(false);
              onRun();
            }}
          >
            Run
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
