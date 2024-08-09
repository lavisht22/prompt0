import "./App.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Home from "./routes/home";
import SignIn from "./routes/(auth)/sign-in/page";
import AuthLayout from "./routes/(auth)/layout";

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
        element: <SignIn />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
