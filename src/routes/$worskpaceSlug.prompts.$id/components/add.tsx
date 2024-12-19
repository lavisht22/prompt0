import { Button, Dropdown, DropdownTrigger } from "@nextui-org/react";

export default function Add() {
  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          variant="flat"
          size="sm"
          startContent={<LuPlus />}
          onPress={() =>
            addMessage({
              role: "assistant",
              content: "",
            })
          }
        >
          Assistant
        </Button>
      </DropdownTrigger>
    </Dropdown>
  );
}
