import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
} from "@nextui-org/react";
import { useEffect, useState } from "react";

export default function Name({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) {
  const { isOpen, onOpenChange, onOpen, onClose } = useDisclosure();
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value, isOpen]);

  return (
    <div>
      <Button
        variant="light"
        size="sm"
        className="text-base font-normal"
        onPress={onOpen}
      >
        {value}
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader>Rename Prompt</ModalHeader>
          <ModalBody>
            <Input
              isInvalid={internalValue.length === 0}
              variant="flat"
              placeholder="Name"
              value={internalValue}
              onValueChange={setInternalValue}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              isDisabled={internalValue.length === 0}
              onPress={() => {
                onValueChange(internalValue);
                onClose();
              }}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
