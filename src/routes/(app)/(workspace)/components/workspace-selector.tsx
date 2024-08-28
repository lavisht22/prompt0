import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
  Avatar,
  Listbox,
  ListboxItem,
  useDisclosure,
} from "@nextui-org/react";
import { useAuth } from "contexts/auth-context";
import { LuChevronDown, LuPlus } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import useWorkspacesStore from "stores/workspaces";

export default function WorkspaceSelector() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isOpen, onOpenChange, onClose } = useDisclosure();

  const { workspaces, activeWorkspace } = useWorkspacesStore();

  return (
    <Popover
      backdrop="blur"
      placement="bottom-start"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <PopoverTrigger>
        <Button
          className="justify-start px-0"
          variant="light"
          disableRipple
          startContent={
            <Avatar
              className="ml-1"
              size="sm"
              radius="sm"
              fallback={
                <span className="text-base font-bold text-default-600">
                  {activeWorkspace?.name?.[0]}
                </span>
              }
            />
          }
          endContent={<LuChevronDown className="mr-2" />}
        >
          {activeWorkspace?.name}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex flex-col items-start p-0 min-w-80 overflow-hidden">
        <div className="border-b p-2 px-4 w-full">
          <p className="text-xs text-default-500">{user?.email}</p>
        </div>
        <div className="w-full border-b">
          <Listbox className="w-full" aria-label="workspaces">
            {workspaces.map((workspace) => (
              <ListboxItem
                variant="flat"
                key={workspace.id}
                value={workspace.id}
                className="w-full"
                onPress={() => {
                  navigate(`/${workspace.slug}/prompts`);
                  onClose();
                }}
                startContent={
                  <Avatar
                    size="sm"
                    radius="sm"
                    fallback={
                      <span className="text-base font-bold text-default-600">
                        {workspace.name?.[0]}
                      </span>
                    }
                  />
                }
              >
                {workspace.name}
              </ListboxItem>
            ))}
          </Listbox>
        </div>
        <div className="bg-default-100 w-full p-2">
          <Button
            isDisabled
            fullWidth
            variant="light"
            size="sm"
            className="justify-start"
            startContent={<LuPlus />}
          >
            <span className="text-xs">Create or join a workspace</span>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
