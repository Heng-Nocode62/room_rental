import AppLayout from "../components/layout/AppLayout";
import OwnerLayout from "../components/layout/OwnerLayout";
import StaffLayout from "../components/layout/StaffLayout";
import UserLayout from "../components/layout/user/UserLayout";
import { LocationScopeProvider } from "../features/location-scope/LocationScopeProvider";
import { useCurrentUser } from "../features/auth/hooks/useCurrentUser";
import { resolveAppRole } from "./role/roleUtils";
import { LoadingState } from "../components/ui";

export default function RoleAwareWorkspaceLayout() {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading || !user) {
    return <LoadingState />;
  }

  const role = resolveAppRole(user);

  if (role === "ADMIN") {
    return <AppLayout />;
  }

  if (role === "OWNER") {
    return (
      <LocationScopeProvider>
        <OwnerLayout />
      </LocationScopeProvider>
    );
  }

  if (role === "STAFF") {
    return (
      <LocationScopeProvider>
        <StaffLayout />
      </LocationScopeProvider>
    );
  }

  return <UserLayout />;
}
