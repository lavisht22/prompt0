import "./App.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Home from "./routes/home";
import SignIn from "./routes/sign-in";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/sign-in",
    element: <SignIn />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
