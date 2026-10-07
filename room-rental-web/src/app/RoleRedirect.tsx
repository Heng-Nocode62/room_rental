import { Navigate } from "react-router-dom";
import { LoadingState } from "../components/ui";
import { useCurrentUser } from "../features/auth/hooks/useCurrentUser";
import { resolveAppRole, roleHome } from "./role/roleUtils";

export default function RoleRedirect() {
  const { data: user, isLoading, isError } = useCurrentUser();
  if (isLoading) return <LoadingState />;
  if (isError || !user) return <Navigate to="/login" replace />;
  return <Navigate to={roleHome(resolveAppRole(user))} replace />;
}
