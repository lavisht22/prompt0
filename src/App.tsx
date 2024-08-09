import "./App.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Home from "./routes/home";
import SignInPage from "./routes/(auth)/sign-in/page";
import SignUpPage from "./routes/(auth)/sign-up/page";
import AuthLayout from "./routes/(auth)/layout";
import { Toaster } from "react-hot-toast";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
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
