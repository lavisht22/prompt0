import "./App.css";

import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  useNavigate,
} from "react-router-dom";

import HomePage from "./routes/(app)/home/page";
import { Toaster } from "react-hot-toast";
import AppLayout from "./routes/(app)/layout";
import WorkspaceLayout from "./routes/(app)/(workspace)/layout";
import PromptsPage from "./routes/(app)/(workspace)/prompts/page";
import ProvidersPage from "./routes/(app)/(workspace)/providers/page";
import PromptDetailsPage from "routes/(app)/(workspace)/prompt-details/page";
import { ThemeProvider } from "next-themes";
import { NextUIProvider } from "@nextui-org/react";
import ProviderDetailsPage from "routes/(app)/(workspace)/provider-details/page";
import LogsPage from "routes/(app)/(workspace)/logs-page/page";
import AuthProvider from "contexts/auth-context";
import LoginPage from "routes/login/route";
import LoginLayout from "routes/login/layout";
import LoginEmailPage from "routes/login.email/route";

const RootLayout = () => {
  const navigate = useNavigate();

  return (
    <NextUIProvider navigate={navigate}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <AuthProvider>
          <Outlet />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </NextUIProvider>
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
            path: ":workspaceSlug",
            element: <WorkspaceLayout />,
            children: [
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
