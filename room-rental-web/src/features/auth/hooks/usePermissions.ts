
import { useCurrentUser } from "./useCurrentUser";

export function usePermissions() {
  const { data: user } = useCurrentUser();

  const permissions = new Set(
    user?.roles.flatMap((role) =>
      role.permissions.map((permission) => permission.code),
    ) ?? [],
  );

  const hasPermission = (permission: string) => {
    return permissions.has(permission);
  };

  const hasAnyPermission = (required: string[]) => {
    return required.some((permission) => permissions.has(permission));
  };

  const hasAllPermissions = (required: string[]) => {
    return required.every((permission) => permissions.has(permission));
  };

  return {
    user,
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}
