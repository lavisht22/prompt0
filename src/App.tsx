import "./App.css";

import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  useNavigate,
} from "react-router-dom";

import { Toaster } from "react-hot-toast";
import AppLayout from "./routes/(app)/layout";
import PromptsPage from "./routes/$worskpaceSlug.prompts/route";
import ProvidersPage from "./routes/$worskpaceSlug.providers/route";
import { ThemeProvider } from "next-themes";
import { HeroUIProvider } from "@heroui/react";
import AuthProvider from "contexts/auth-context";
import LoginPage from "routes/login/route";
import LoginLayout from "routes/login/layout";
import LoginEmailPage from "routes/login.email/route";
import WelcomePage from "routes/welcome/route";
import HomePage from "routes/home/route";
import WorkspaceLayout from "routes/$workspaceSlug/layout";
import PromptDetailsPage from "routes/$worskpaceSlug.prompts.$id/route";
import ProviderDetailsPage from "routes/$workspaceSlug.providers.$id/route";
import LogsPage from "routes/$workspaceSlug.logs/route";
import WorkspaceDashboardPage from "routes/$workspaceSlug/route";

const RootLayout = () => {
  const navigate = useNavigate();

  return (
    <HeroUIProvider navigate={navigate}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <AuthProvider>
          <Outlet />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </HeroUIProvider>
  );
};

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
        index: true,
      },
      {
        element: <AppLayout />,
        children: [
          {
            path: "/welcome",
            element: <WelcomePage />,
          },
          {
            path: ":workspaceSlug",
            element: <WorkspaceLayout />,
            children: [
              {
                path: "",
                element: <WorkspaceDashboardPage />,
              },
              {
                path: "prompts",
                element: <PromptsPage />,
              },
              {
                path: "prompts/:promptId",
                element: <PromptDetailsPage />,
              },
              {
                path: "providers",
                element: <ProvidersPage />,
              },
              {
                path: "providers/:providerId",
                element: <ProviderDetailsPage />,
              },
              {
                path: "logs",
                element: <LogsPage />,
              },
            ],
          },
        ],
      },
      {
        path: "/login",
        element: <LoginLayout />,
        children: [
          {
            path: "",
            element: <LoginPage />,
          },
          {
            path: "email",
            element: <LoginEmailPage />,
          },
        ],
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
