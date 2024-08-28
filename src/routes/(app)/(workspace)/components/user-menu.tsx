import {
  Avatar,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@nextui-org/react";
import { useAuth } from "contexts/auth-context";
import { LuChevronRight, LuLogOut, LuSettings2, LuUser } from "react-icons/lu";

export default function UserMenu() {
  const { user } = useAuth();

  return (
    <Popover backdrop="blur" placement="right-end">
      <PopoverTrigger>
        <Button
          variant="light"
          startContent={
            <Avatar
              size="sm"
              className="ml-1"
              fallback={<LuUser className="w-4 h-4" />}
            />
          }
          endContent={<LuChevronRight className="mr-2" />}
          fullWidth
          className="justify-start  px-0"
        >
          <span className="block flex-1 text-left">
            {user?.user_metadata.name}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="min-w-64 flex flex-col justify-start items-start p-0">
        <div className="border-b p-2 mt-1 space-y-2 w-full">
          <p className="text-xs text-default-500">Signed in as</p>
          <Button
            variant="flat"
            startContent={
              <Avatar
                size="sm"
                className="ml-2"
                fallback={<LuUser className="w-4 h-4" />}
              />
            }
            endContent={<LuSettings2 className="mr-2" />}
            fullWidth
            className="justify-start px-0 h-14"
          >
            <div className="flex-1 text-left">
              <span className="block">{user?.user_metadata.name}</span>
              <span className="block text-xs text-default-500">
                {user?.email}
              </span>
            </div>
          </Button>
        </div>
        <div className="w-full p-2 space-y-2">
          <Button
            fullWidth
            variant="light"
            startContent={<LuLogOut />}
            color="danger"
            className="justify-start px-2"
          >
            Logout
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
