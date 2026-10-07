import type { AuthUser } from "../../features/auth/types/auth";

export type AppRole = "ADMIN" | "OWNER" | "STAFF" | "USER";

export function normalizeRoleCode(code: string): string {
  return code.trim().toUpperCase().replace(/[- ]/g, "_");
}

export function hasAppRole(
  user: AuthUser | undefined,
  role: AppRole,
): boolean {
  if (!user) return false;

  return user.roles.some((item) => {
    const code = normalizeRoleCode(item.code);

    if (role === "ADMIN") {
      return code === "ADMIN" || code === "SUPER_ADMIN";
    }

    if (role === "OWNER") {
      return code === "OWNER" || code === "SHOP_OWNER";
    }

    return code === role;
  });
}

export function resolveAppRole(user: AuthUser): AppRole {
  if (hasAppRole(user, "ADMIN")) return "ADMIN";
  if (hasAppRole(user, "OWNER")) return "OWNER";
  if (hasAppRole(user, "STAFF")) return "STAFF";

  return "USER";
}

export function roleHome(role: AppRole): string {
  switch (role) {
    case "ADMIN":
      return "/dashboard";

    case "OWNER":
      return "/owner/dashboard";

    case "STAFF":
      return "/staff/dashboard";

    default:
      return "/user/dashboard";
  }
}