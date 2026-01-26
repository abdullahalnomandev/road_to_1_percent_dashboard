import { createBrowserRouter } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import LoginPage from "../pages/login";
import ForgetPasswordPage from "../pages/forget-password";
import PrivateRoute from "../provider/PrivateRoutes";
import { MENU_CONFIG } from "../constant/sidebarMenue";
import ProfilePage from "../pages/profile";
import NotificationPage from "../pages/notificationPage";
import ResetPassword from "../component/resetPassword";
import DeleteAccountPage from "../pages/delete-account";

// Dynamically create children routes from MENU_CONFIG, skipping dashboard ("/")
const dynamicChildren = MENU_CONFIG.filter(item => item.path !== "/").map(item => ({
  path: item.path.replace(/^\//, ""), // remove leading slash for react-router children
  element: item.element,
}));

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/delete-account",
    element: <DeleteAccountPage />,
  },
  {
    path: "/forget-password",
    element: <ForgetPasswordPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/",
    element: (
      <PrivateRoute>
        <DashboardLayout />
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        element: MENU_CONFIG.find(item => item.path === "/")?.element,
      },
      {
        path: "/profile",
        element: <ProfilePage />,
      },
      {
        path: "/notifications",
        element: <NotificationPage />,
      },
      ...dynamicChildren,
    ],
  },
]);
