import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import OwnerLayout from "../components/layout/OwnerLayout";
import StaffLayout from "../components/layout/StaffLayout";
import LoginPage from "../features/auth/pages/LoginPage";
import RoleRedirect from "./RoleRedirect";
import RequireRole from "./RequireRole";
import ProtectedRoute from "./ProtectedRoute";
import RoleAwareWorkspaceLayout from "./RoleAwareWorkspaceLayout";
import { LocationScopeProvider } from "../features/location-scope/LocationScopeProvider";
import AdminDashboardPage from "../features/admin/pages/AdminDashboardPage";
import AdminRoomsPage from "../features/admin/pages/AdminRoomsPage";
import AdminReservationsPage from "../features/admin/pages/AdminReservationsPage";
import AdminRoomBlocksPage from "../features/admin/pages/AdminRoomBlocksPage";
import AdminLocationsPage from "../features/admin/pages/AdminLocationsPage";
import AdminRoomTypesPage from "../features/admin/pages/AdminRoomTypesPage";
import AdminAmenitiesPage from "../features/admin/pages/AdminAmenitiesPage";
import AdminRoomPricesPage from "../features/admin/pages/AdminRoomPricesPage";
import AdminUsersPage from "../features/admin/pages/AdminUsersPage";
import AdminRolesPage from "../features/admin/pages/AdminRolesPage";
import AdminSettingsPage from "../features/admin/pages/AdminSettingsPage";
import AdminLanguagesPage from "../features/admin/pages/AdminLanguagesPage";
import AdminAuditLogsPage from "../features/admin/pages/AdminAuditLogsPage";

import StaffDashboardPage from "../features/staff/pages/StaffDashboardPage";
import StaffRoomsPage from "../features/staff/pages/StaffRoomsPage";
import StaffReservationsPage from "../features/staff/pages/StaffReservationsPage";
import StaffRoomBlocksPage from "../features/staff/pages/StaffRoomBlocksPage";
import StaffRoomTypesPage from "../features/staff/pages/StaffRoomTypesPage";
import StaffAmenitiesPage from "../features/staff/pages/StaffAmenitiesPage";
import StaffRoomPricesPage from "../features/staff/pages/StaffRoomPricesPage";
import UserDashboardPage from "../features/user/pages/UserDashboardPage";
import UserProfilePage from "../features/user/pages/UserProfilePage";
import HourlyAvailabilityPage from "../features/availability/pages/AvailabilityPage";
import DailyAvailabilityPage from "../features/availability/pages/DailyAvailabilityPage";
import OwnerAmenitiesPage from "../features/owner/pages/OwnerAmenitiesPage";
import OwnerDashboardPage from "../features/owner/pages/OwnerDashboardPage";
import OwnerLocationPage from "../features/owner/pages/OwnerLocationPage";
import OwnerReservationsPage from "../features/owner/pages/OwnerReservationsPage";
import OwnerRoomBlocksPage from "../features/owner/pages/OwnerRoomBlocksPage";
import OwnerRoomPricesPage from "../features/owner/pages/OwnerRoomPricesPage";
import OwnerRoomsPage from "../features/owner/pages/OwnerRoomsPage";
import OwnerRoomTypesPage from "../features/owner/pages/OwnerRoomTypesPage";
import OwnerStaffPage from "../features/owner/pages/OwnerStaffPage";
import AdminPermissionsPage from "../features/admin/pages/AdminPermissionsPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import VerifyEmailPage from "../features/auth/pages/VerifyEmailPage";
import UserReservationsPage from "../features/user/pages/UserReservationsPage";
import UserRoomDetailsPage from "../features/user/pages/UserRoomDetailsPage";
import UserBrowseRoomsPage from "../features/user/pages/UserBrowseRoomsPage";
import UserPortalLayout from "../features/user/components/UserPortalLayout";
import { UserThemeProvider } from "../features/user/UserThemeProvider";
import AdminUserLocationRolesPage from "../features/admin/pages/AdminLocationRolesPage";
import ForgotPasswordPage from "../features/auth/pages/ForgetPasswordPage";
import ResetPasswordPage from "../features/auth/pages/ResetPasswordPage";
import AccountProfilePage from "../features/auth/pages/AccountProfilePage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/verify-email", element: <VerifyEmailPage /> },
   { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/app", element: <RoleRedirect /> },
      {
        element: <RequireRole role="ADMIN" />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: "/profile", element: <AccountProfilePage /> },
              { path: "/dashboard", element: <AdminDashboardPage /> },
              { path: "/rooms", element: <AdminRoomsPage /> },
              { path: "/reservations", element: <AdminReservationsPage /> },
              { path: "/room-blocks", element: <AdminRoomBlocksPage /> },
              { path: "/locations", element: <AdminLocationsPage /> },
              { path: "/room-types", element: <AdminRoomTypesPage /> },
              { path: "/amenities", element: <AdminAmenitiesPage /> },
              { path: "/room-prices", element: <AdminRoomPricesPage /> },
              { path: "/users", element: <AdminUsersPage /> },
              { path: "/roles", element: <AdminRolesPage /> },
              { path: "/settings", element: <AdminSettingsPage /> },
              { path: "/languages", element: <AdminLanguagesPage /> },
              { path: "/audit-logs", element: <AdminAuditLogsPage /> },
              { path: "/rooms/new", element: <Navigate to="/rooms" replace /> },
              { path: "/rooms/:id", element: <Navigate to="/rooms" replace /> },
              { path: "/permissions", element: <AdminPermissionsPage /> },
              { path: "/user-location-roles", element: <AdminUserLocationRolesPage /> },
              {
                path: "/room-blocks/new",
                element: <Navigate to="/room-blocks" replace />,
              },
              {
                path: "/room-blocks/:id",
                element: <Navigate to="/room-blocks" replace />,
              },
              {
                path: "/locations/new",
                element: <Navigate to="/locations" replace />,
              },
              {
                path: "/locations/:id",
                element: <Navigate to="/locations" replace />,
              },
              {
                path: "/room-types/new",
                element: <Navigate to="/room-types" replace />,
              },
              {
                path: "/room-types/:id",
                element: <Navigate to="/room-types" replace />,
              },
              { path: "/users/new", element: <Navigate to="/users" replace /> },
              { path: "/users/:id", element: <Navigate to="/users" replace /> },
              { path: "/roles/new", element: <Navigate to="/roles" replace /> },
              { path: "/roles/:id", element: <Navigate to="/roles" replace /> },
              {
                path: "/languages/new",
                element: <Navigate to="/languages" replace />,
              },
              {
                path: "/languages/:id",
                element: <Navigate to="/languages" replace />,
              },
            ],
          },
        ],
      },
      {
        element: <RequireRole role="OWNER" />,
        children: [
          {
            element: (
              <LocationScopeProvider>
                <OwnerLayout />
              </LocationScopeProvider>
            ),
            children: [
              { path: "/owner/profile", element: <AccountProfilePage /> },
              { path: "/owner/dashboard", element: <OwnerDashboardPage /> },
              { path: "/owner/rooms", element: <OwnerRoomsPage /> },
              {
                path: "/owner/reservations",
                element: <OwnerReservationsPage />,
              },
              { path: "/owner/room-blocks", element: <OwnerRoomBlocksPage /> },
              { path: "/owner/room-types", element: <OwnerRoomTypesPage /> },
              { path: "/owner/amenities", element: <OwnerAmenitiesPage /> },
              { path: "/owner/room-prices", element: <OwnerRoomPricesPage /> },
              { path: "/owner/staff", element: <OwnerStaffPage /> },
              { path: "/owner/location", element: <OwnerLocationPage /> },
            ],
          },
        ],
      },
      {
        element: <RequireRole role="STAFF" />,
        children: [
          {
            element: (
              <LocationScopeProvider>
                <StaffLayout />
              </LocationScopeProvider>
            ),
            children: [
              { path: "/staff/dashboard", element: <StaffDashboardPage /> },
              { path: "/staff/rooms", element: <StaffRoomsPage /> },
              {
                path: "/staff/reservations",
                element: <StaffReservationsPage />,
              },
              { path: "/staff/room-blocks", element: <StaffRoomBlocksPage /> },
              { path: "/staff/room-types", element: <StaffRoomTypesPage /> },
              { path: "/staff/amenities", element: <StaffAmenitiesPage /> },
              { path: "/staff/room-prices", element: <StaffRoomPricesPage /> },
            ],
          },
        ],
      },
      {
        element: <RequireRole role="USER" />,
        children: [
          {
            element: (
              <UserThemeProvider>
                <UserPortalLayout />
              </UserThemeProvider>
            ),
            children: [
              {
                path: "/user/dashboard",
                element: <UserDashboardPage />,
              },
              {
                path: "/user/rooms",
                element: <UserBrowseRoomsPage />,
              },
              {
                path: "/user/rooms/:id",
                element: <UserRoomDetailsPage />,
              },
              {
                path: "/user/reservations",
                element: <UserReservationsPage />,
              },
              {
                path: "/user/profile",
                element: <UserProfilePage />,
              },
            ],
          },
        ],
      },
      {
        element: <RoleAwareWorkspaceLayout />,
        children: [
          { path: "/availability/hourly", element: <HourlyAvailabilityPage /> },
          { path: "/availability/daily", element: <DailyAvailabilityPage /> },
        ],
      },
    ],
  },
  { path: "/", element: <Navigate to="/app" replace /> },
  { path: "*", element: <Navigate to="/app" replace /> },
]);
