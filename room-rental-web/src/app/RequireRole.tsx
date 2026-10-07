import { Navigate, Outlet, useLocation } from "react-router-dom";
import { LoadingState } from "../components/ui";
import { useCurrentUser } from "../features/auth/hooks/useCurrentUser";
import { hasAppRole, roleHome, type AppRole } from "./role/roleUtils";

export default function RequireRole({ role }: { role: AppRole }) {
  const location = useLocation();
  const { data: user, isLoading, isError } = useCurrentUser();
  if (isLoading) return <LoadingState />;
  if (isError || !user)
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!hasAppRole(user, role))
    return (
      <Navigate to={roleHome(role === "ADMIN" ? "ADMIN" : role)} replace />
    );
  return <Outlet />;
}
