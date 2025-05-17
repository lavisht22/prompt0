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
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import supabase from "utils/supabase";

export default function Name({
  value,
  onValueChange,
  promptId,
}: {
  value: string;
  onValueChange: (value: string) => void;
  promptId: string;
}) {
  const { isOpen, onOpenChange, onOpen, onClose } = useDisclosure();
  const [internalValue, setInternalValue] = useState(value);
  const [loading, setLoading] = useState(false);

  const updateName = useCallback(async () => {
    try {
      if (!promptId) {
        return;
      }
      setLoading(true);

      if (promptId !== "create") {
        await supabase
          .from("prompts")
          .update({ name: internalValue, updated_at: new Date().toISOString() })
          .eq("id", promptId)
          .throwOnError();
      }

      onValueChange(internalValue);
      onClose();
    } catch {
      toast.error("Oops! Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [internalValue, onClose, onValueChange, promptId]);

  useEffect(() => {
    setInternalValue(value);
  }, [value, isOpen]);

  return (
    <div>
      <Button
        variant="light"
        size="sm"
        className="font-normal text-base px-1"
        onPress={onOpen}
      >
        {value === "" ? (
          <span className="text-default-400">Untitled Prompt</span>
        ) : (
          value
        )}
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader>Rename Prompt</ModalHeader>
          <ModalBody>
            <Input
              isInvalid={internalValue.length === 0}
              variant="flat"
              placeholder="Untitled Prompt"
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
              onPress={updateName}
              isLoading={loading}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
