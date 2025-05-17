import {
  Button,
  useDisclosure,
  Card,
  CardBody,
  Chip,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
} from "@nextui-org/react";
import { Version } from "../route";
import { formatDistanceToNow } from "date-fns";

export default function History({
  versions,
  activeVersionId,
  setActiveVersionId,
}: {
  versions: Version[];
  activeVersionId: string | null;
  setActiveVersionId: (id: string) => void;
}) {
  const { isOpen, onOpenChange, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button size="sm" isIconOnly onPress={onOpen} variant="flat">
        <span className="text-xs font-medium">
          v{versions.find((v) => v.id === activeVersionId)?.number}
        </span>
      </Button>
      <Drawer
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        backdrop="blur"
        scrollBehavior="inside"
      >
        <DrawerContent>
          <DrawerHeader>Version History</DrawerHeader>
          <DrawerBody>
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
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
