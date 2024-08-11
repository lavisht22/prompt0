import { Outlet } from "react-router-dom";

import Sidebar from "./components/sidebar";

export default function WorkspaceLayout() {
  return (
    <div className="flex w-screen h-screen bg-default-100">
      <Sidebar />
      <div className="flex-1 p-2">
        <div className="bg-background h-full rounded-md overflow-hidden shadow-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
