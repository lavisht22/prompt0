import { Avatar, Button, Link } from "@nextui-org/react";
import { useLocation } from "react-router-dom";

import WorkspaceSelector from "./workspace-selector";
import useWorkspacesStore from "stores/workspaces";

const LINKS = [
  {
    name: "Prompts",
    to: "prompts",
  },
  {
    name: "Providers",
    to: "providers",
  },
];

export default function Sidebar() {
  const { activeWorkspace } = useWorkspacesStore();
  const { pathname } = useLocation();

  console.log(pathname);
  return (
    <div className="w-56 h-full flex flex-col items-start justify-between px-2 py-4">
      <div className="flex flex-col w-full">
        <WorkspaceSelector />

        <div className="flex flex-col mt-10">
          {LINKS.map((link) => {
            const isActive = pathname.startsWith(
              `/${activeWorkspace?.slug}/${link.to}`
            );

            return (
              <Button
                variant={isActive ? "flat" : "light"}
                className="w-full justify-start px-2"
                href={`/${activeWorkspace?.slug}/${link.to}`}
                as={Link}
              >
                {link.name}
              </Button>
            );
          })}
        </div>
      </div>

      <Avatar />
    </div>
  );
}
