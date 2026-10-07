import {
  Button,
  Card,
} from "../../../../components/ui";

import {
  Edit3,
  ShieldCheck,
} from "../../../../components/ui/MaterialIcon";

import type { RoleResponse } from "../../../roles/types/role";

interface RoleCardProps {
  role: RoleResponse;
  onEdit: () => void;
  onPermissions: () => void;
  onToggle: () => void;
}

export function RoleCard({
  role,
  onEdit,
  onPermissions,
  onToggle,
}: RoleCardProps) {
  return (
    <Card className="overflow-hidden p-0">
      {/* HEADER */}
      <div className="border-b border-slate-200 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ShieldCheck size={23} />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-slate-900">
                  {role.name}
                </h2>

                <StatusBadge
                  active={role.isActive}
                />
              </div>

              <p className="mt-1 font-mono text-xs text-slate-500">
                {role.code}
              </p>
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-500">
          {role.description ||
            "No description."}
        </p>
      </div>

      {/* PERMISSION SUMMARY */}
      <div className="px-5 py-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">
            Permissions
          </span>

          <span className="text-sm font-semibold text-slate-900">
            {role.permissions.length}
          </span>
        </div>

        {role.permissions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {role.permissions
              .slice(0, 5)
              .map((permission) => (
                <span
                  key={
                    permission.id
                  }
                  className="rounded-md bg-slate-100 px-2 py-1 font-mono text-[11px] text-slate-600"
                >
                  {permission.code}
                </span>
              ))}

            {role.permissions.length >
              5 && (
              <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] text-slate-500">
                +
                {role.permissions
                  .length - 5}{" "}
                more
              </span>
            )}
          </div>
        )}
      </div>

      {/* ACTIONS */}
      <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 px-5 py-3">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<Edit3 size={14} />}
          onClick={onEdit}
        >
          Edit
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onPermissions}
          >
            Permissions
          </Button>

          <button
            type="button"
            onClick={onToggle}
            className={[
              "rounded-lg px-3 py-2 text-xs font-medium transition",
              role.isActive
                ? "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                : "bg-blue-50 text-blue-600 hover:bg-blue-100",
            ].join(" ")}
          >
            {role.isActive
              ? "Deactivate"
              : "Activate"}
          </button>
        </div>
      </div>
    </Card>
  );
}

interface StatusBadgeProps {
  active: boolean;
}

function StatusBadge({
  active,
}: StatusBadgeProps) {
  return (
    <span
      className={[
        "rounded-full px-2.5 py-1 text-xs font-medium",
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-500",
      ].join(" ")}
    >
      {active
        ? "Active"
        : "Inactive"}
    </span>
  );
}