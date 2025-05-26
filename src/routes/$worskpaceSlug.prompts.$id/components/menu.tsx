import {
  Dropdown,
  DropdownTrigger,
  Button,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { BsThreeDotsVertical } from "react-icons/bs";
import DeleteDialog from "./delete-dialog";
import { useState } from "react";

export default function Menu({ promptId }: { promptId: string }) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <Dropdown>
        <DropdownTrigger>
          <Button size="sm" isIconOnly variant="light">
            <BsThreeDotsVertical />
          </Button>
        </DropdownTrigger>
        <DropdownMenu>
          <DropdownItem
            key="delete"
            color="danger"
            onPress={() => setDeleteOpen(true)}
          >
            Delete
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <DeleteDialog
        promptId={promptId}
        isOpen={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}
