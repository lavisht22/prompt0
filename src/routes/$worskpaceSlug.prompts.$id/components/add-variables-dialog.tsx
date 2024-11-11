import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalBody,
  Textarea,
  Button,
  ModalFooter,
} from "@nextui-org/react";
import { useState } from "react";
import { LuPlus } from "react-icons/lu";

export default function AddVariablesDialog({
  isOpen,
  onOpenChange,
  variables,
  onAdd,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  variables: string[];
  onAdd: (values: Record<string, string>) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);

  const [values, setValues] = useState<Record<string, string>>(
    variables.reduce((acc, variable) => {
      acc[variable] = "";
      return acc;
    }, {} as Record<string, string>)
  );

  const handleAdd = async () => {
    setLoading(true);
    await onAdd(values);
    setLoading(false);
    onOpenChange(false);
    // Clear the values after adding
    setValues(
      variables.reduce((acc, variable) => {
        acc[variable] = "";
        return acc;
      }, {} as Record<string, string>)
    );
  };

  return (
    <Modal
      backdrop="blur"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      scrollBehavior="inside"
      size="2xl"
    >
      <ModalContent>
        <ModalHeader>Add Row</ModalHeader>
        <ModalBody>
          {variables.map((variable) => {
            return (
              <Textarea
                label={`{{${variable}}}`}
                labelPlacement="outside"
                maxRows={1000000}
                value={values[variable]}
                onValueChange={(newValue) => {
                  setValues({ ...values, [variable]: newValue });
                }}
              />
            );
          })}
        </ModalBody>
        <ModalFooter>
          <Button
            fullWidth
            startContent={<LuPlus />}
            color="primary"
            isDisabled={variables.some((variable) => values[variable] === "")}
            isLoading={loading}
            onPress={handleAdd}
          >
            Add
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
