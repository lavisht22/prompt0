import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import supabase from "utils/supabase";

export default function DeleteDialog({
  isOpen,
  onOpenChange,
  promptId,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  promptId: string;
}) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const deletePrompt = useCallback(async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("prompts")
        .delete()
        .eq("id", promptId);

      if (error) {
        throw error;
      }

      navigate(-1);
    } catch {
      toast.error("Oops! Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [navigate, promptId]);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>Confirm</ModalHeader>
        <ModalBody>
          Are you sure you want to delete this prompt? This action cannot be
          undone.
        </ModalBody>
        <ModalFooter>
          <Button variant="light">Cancel</Button>
          <Button color="danger" isLoading={loading} onPress={deletePrompt}>
            Delete
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
