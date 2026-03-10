import ReactDOM from "react-dom/client";
import Login from "./pages/Login";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import Register from "./pages/Register";
import Images from "./pages/Images";
import { AuthProvider } from "./context/AuthContext";
import PersistLogin from "./components/PersistLogin";

const AppLayout = () => {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        element: <PersistLogin />,
        children: [{
          path: '/images',
          element: <Images />
        }]
      },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<RouterProvider router={router} />);
