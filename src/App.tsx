import "./App.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import HomePage from "./routes/(app)/home/page";
import SignInPage from "./routes/(auth)/sign-in/page";
import SignUpPage from "./routes/(auth)/sign-up/page";
import AuthLayout from "./routes/(auth)/layout";
import { Toaster } from "react-hot-toast";
import AppLayout from "./routes/(app)/layout";

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
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
