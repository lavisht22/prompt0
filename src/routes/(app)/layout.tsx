import { Outlet } from "react-router-dom";
import AppProviders from "./providers";

export default function AppLayout() {
  return (
    <AppProviders>
      <Outlet />
    </AppProviders>
  );
}
