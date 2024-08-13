import "./App.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import HomePage from "./routes/(app)/home/page";
import SignInPage from "./routes/(auth)/sign-in/page";
import SignUpPage from "./routes/(auth)/sign-up/page";
import AuthLayout from "./routes/(auth)/layout";
import { Toaster } from "react-hot-toast";
import AppLayout from "./routes/(app)/layout";
import WorkspaceLayout from "./routes/(app)/(workspace)/layout";
import PromptsPage from "./routes/(app)/(workspace)/prompts/page";
import ProvidersPage from "./routes/(app)/(workspace)/providers/page";
import PromptDetailsPage from "routes/(app)/(workspace)/prompt-details/page";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
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
            path: "logs",
            element: <div>Logs Page</div>,
          },
        ],
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/sign-in",
        element: <SignInPage />,
      },
      {
        path: "/sign-up",
        element: <SignUpPage />,
      },
    ],
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}

export default App;
