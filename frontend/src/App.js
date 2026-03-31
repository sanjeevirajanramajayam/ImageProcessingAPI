import ReactDOM from "react-dom/client";
import Login from "./pages/Login";
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from "react-router-dom";
import Register from "./pages/Register";
import Images from "./pages/Images";
import { AuthProvider } from "./context/AuthContext";
import PersistLogin from "./components/PersistLogin";
import Navbar from "./components/Navbar";
import UploadImage from "./pages/UploadImage";
import HomePage from "./pages/HomePage";
import TransformImage from "./pages/TransformImage";
import { LoadProvdier } from "./context/LoadingContext";

// Hello, Everyone!

const AppLayout = () => {
  return (
    <AuthProvider>
      <LoadProvdier>
        <Outlet />
      </LoadProvdier>
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
        element: <Navigate to="/login" />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        element: <PersistLogin />,
        children: [
          {
            element: (
              <div className="flex h-screen flex-col">
                <Navbar />
                <div className="flex-1">
                  <Outlet />
                </div>
              </div>
            ),
            children: [
              {
                path: "/images",
                element: <Images />,
              },
              {
                path: "/upload-image",
                element: <UploadImage />,
              },
              {
                path: "/image/:id/transform",
                element: <TransformImage />,
              },
              {
                path: "/home",
                element: <HomePage />,
              },
            ],
          },
        ],
      },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<RouterProvider router={router} />);
