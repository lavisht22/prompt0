import { Button, cn, Link } from "@heroui/react";
import { useLocation } from "react-router-dom";

import WorkspaceSelector from "./workspace-selector";
import useWorkspacesStore from "stores/workspaces";
import UserMenu from "./user-menu";
import {
  LuBarChart2,
  LuFileTerminal,
  LuMessageCircle,
  LuPanelLeftClose,
  LuPanelLeftOpen,
  LuServer,
} from "react-icons/lu";
import { useEffect, useMemo, useState } from "react";

export default function Sidebar() {
  const { activeWorkspace } = useWorkspacesStore();
  const { pathname } = useLocation();

  const [collapsed, setCollapsed] = useState(false);

  const links = useMemo(
    () => [
      {
        name: "Dashboard",
        to: `/${activeWorkspace?.slug}`,
        icon: <LuBarChart2 className="size-5" />,
      },
      {
        name: "Prompts",
        to: `/${activeWorkspace?.slug}/prompts`,
        icon: <LuMessageCircle className="size-5" />,
      },
      {
        name: "Providers",
        to: `/${activeWorkspace?.slug}/providers`,
        icon: <LuServer className="size-5" />,
      },
      {
        name: "Logs",
        to: `/${activeWorkspace?.slug}/logs`,
        icon: <LuFileTerminal className="size-5" />,
      },
    ],
    [activeWorkspace]
  );

  useEffect(() => {
    const collapsed = localStorage.getItem("sidebar-collapsed");
    setCollapsed(collapsed === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", collapsed.toString());
  }, [collapsed]);

  return (
    <div
      className={cn(
        "w-56 h-full flex flex-col items-start justify-between px-2 py-4 transition-all duration-200",
        collapsed && "w-14"
      )}
    >
      <div className="flex flex-col w-full">
        <WorkspaceSelector collapsed={collapsed} />

        <div className="flex flex-col mt-10 gap-1">
          <Button
            isIconOnly={collapsed}
            variant="light"
            className="justify-start px-2 mb-6"
            onClick={() => setCollapsed(!collapsed)}
            startContent={
              collapsed ? (
                <LuPanelLeftOpen className="size-5" />
              ) : (
                <LuPanelLeftClose className="size-5" />
              )
            }
          >
            {collapsed ? null : "Collapse"}
          </Button>

          {links.map((link) => {
            const isActive = pathname === link.to;

            if (collapsed) {
              return (
                <Button
                  key={link.to}
                  isIconOnly
                  variant={isActive ? "flat" : "light"}
                  href={link.to}
                  as={Link}
                  startContent={link.icon}
                />
              );
            }

            return (
              <Button
                key={link.to}
                fullWidth
                variant={isActive ? "flat" : "light"}
                className="animate-appearance-in delay-300 justify-start px-2"
                href={link.to}
                as={Link}
                startContent={link.icon}
              >
                {link.name}
              </Button>
            );
          })}
        </div>
      </div>
      <div className="flex flex-col gap-2 w-full">
        <UserMenu collapsed={collapsed} />
      </div>
    </div>
  );
}
