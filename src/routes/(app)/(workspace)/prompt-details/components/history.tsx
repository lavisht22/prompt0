import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
  Card,
  CardBody,
  Chip,
} from "@nextui-org/react";
import { LuHistory } from "react-icons/lu";
import { Version } from "../prompt";
import { formatDistanceToNow } from "date-fns";

export default function History({
  versions,
  setActiveVersionId,
}: {
  versions: Version[];
  setActiveVersionId: (id: string) => void;
}) {
  const { isOpen, onOpenChange, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button size="sm" isIconOnly onPress={onOpen} variant="light">
        <LuHistory className="w-4 h-4" />
      </Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        backdrop="blur"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>Version History</ModalHeader>
          <ModalBody>
            <div className="space-y-4 pb-4">
              {versions.map((v) => (
                <Card
                  fullWidth
                  key={v.id}
                  isHoverable
                  isPressable
                  onPress={() => {
                    setActiveVersionId(v.id);
                    onClose();
                  }}
                >
                  <CardBody className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3>v{v.number}</h3>
                      {v.published_at !== null && (
                        <Chip variant="dot" color="success" size="sm">
                          Currently Deployed
                        </Chip>
                      )}
                    </div>
                    <p className="text-sm text-default-500">
                      {formatDistanceToNow(v.created_at)} ago
                    </p>
                  </CardBody>
                </Card>
              ))}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
