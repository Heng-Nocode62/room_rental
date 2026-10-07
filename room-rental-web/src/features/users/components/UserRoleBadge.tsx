
import type {
  RoleResponse,
} from "../types/user";


export function UserRoleBadge({
  role,
}: {
  role: RoleResponse;
}) {

  return (
    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
      {role.name}
    </span>
  );
}