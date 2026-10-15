import type { RoleResponse } from "../types/user";

export function UserRoleBadge({ role }: { role: RoleResponse }) {
  return (
    <span
      title={role.code}
      className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700"
    >
      {role.name}
    </span>
  );
}