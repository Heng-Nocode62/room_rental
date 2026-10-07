import { Button } from "../../../../components/ui/Button.tsx";
import { Card } from "../../../../components/ui/Card.tsx";
import {
  Edit3,
  Plus,
  ShieldCheck,
} from "../../../../components/ui/MaterialIcon.tsx";

import type { ModuleResponse } from "../../../module/types/module.ts";
import type { PermissionResponse } from "../../../permissions/types/permission.ts";

interface ModuleSectionProps {
  module: ModuleResponse;
  permissions: PermissionResponse[];

  onEditModule: () => void;
  onAddPermission: () => void;
  onToggleModule: () => void;

  onEditPermission: (permission: PermissionResponse) => void;

  onTogglePermission: (permission: PermissionResponse) => void;
}

export function ModuleSection({
  module,
  permissions,
  onEditModule,
  onAddPermission,
  onToggleModule,
  onEditPermission,
  onTogglePermission,
}: ModuleSectionProps) {
  return (
    <Card className="overflow-hidden p-0">
      {/* MODULE HEADER */}
      <div className="border-b border-slate-200 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* MODULE INFO */}
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ShieldCheck size={23} />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-slate-900">
                  {module.name}
                </h2>

                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {permissions.length}{" "}
                  {permissions.length === 1 ? "permission" : "permissions"}
                </span>

                {!module.isActive && (
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                    Inactive
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* MODULE ACTIONS */}
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Edit3 size={14} />}
              onClick={onEditModule}
            >
              Edit module
            </Button>

            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Plus size={15} />}
              onClick={onAddPermission}
            >
              Add permission
            </Button>

            <button
              type="button"
              onClick={onToggleModule}
              className={[
                "flex h-9 items-center gap-2 rounded-lg border px-3",
                "text-sm font-medium transition",
                module.isActive
                  ? "border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  : "border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100",
              ].join(" ")}
            >
              <ModuleSwitch checked={module.isActive} />

              <span>{module.isActive ? "Active" : "Inactive"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* PERMISSIONS */}
      <div className="p-4">
        {!permissions.length ? (
          <div className="rounded-xl border border-dashed border-slate-300 px-5 py-10 text-center">
            <p className="text-sm font-medium text-slate-700">No permissions</p>

            <p className="mt-1 text-sm text-slate-500">
              Add permissions to this module.
            </p>

            <Button
              variant="secondary"
              size="sm"
              className="mt-4"
              leftIcon={<Plus size={14} />}
              onClick={onAddPermission}
            >
              Add permission
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {permissions.map((permission) => (
              <PermissionCard
                key={permission.id}
                permission={permission}
                onEdit={() => onEditPermission(permission)}
                onToggle={() => onTogglePermission(permission)}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

interface PermissionCardProps {
  permission: PermissionResponse;
  onEdit: () => void;
  onToggle: () => void;
}

function PermissionCard({ permission, onEdit, onToggle }: PermissionCardProps) {
  return (
    <div
      className={[
        "rounded-xl border p-4 transition",
        permission.isActive
          ? "border-slate-200 bg-white hover:border-slate-300"
          : "border-slate-200 bg-slate-50/70",
      ].join(" ")}
    >
      {/* PERMISSION HEADER */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {/* PERMISSION CODE */}
          <span className="inline-flex max-w-full rounded-md bg-blue-50 px-2 py-1 text-[11px] font-semibold tracking-wide text-slate-600">
            {permission.code}
          </span>
        </div>

        {/* PERMISSION SWITCH */}
        <PermissionSwitch checked={permission.isActive} onChange={onToggle} />
      </div>
      <div className="flex items-center justify-between gap-3">
        <div>
          {/* PERMISSION NAME */}
          <h3 className="mt-2 truncate text-sm font-semibold text-slate-900">
            {permission.name}
          </h3>
          {/* DESCRIPTION */}
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
            {permission.description || "No description."}
          </p>
        </div>

        {/* ACTION */}
        <div className="mt-4 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Edit3 size={14} />}
            onClick={onEdit}
          >
            Edit
          </Button>
        </div>
      </div>
    </div>
  );
}

interface PermissionSwitchProps {
  checked: boolean;
  onChange: () => void;
}

function PermissionSwitch({ checked, onChange }: PermissionSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={[
        "relative h-6 w-11 shrink-0 rounded-full transition",
        checked ? "bg-blue-600" : "bg-slate-300",
      ].join(" ")}
    >
      <span
        className={[
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition",
          checked ? "left-[22px]" : "left-0.5",
        ].join(" ")}
      />
    </button>
  );
}

interface ModuleSwitchProps {
  checked: boolean;
}

function ModuleSwitch({ checked }: ModuleSwitchProps) {
  return (
    <span
      className={[
        "relative h-5 w-9 shrink-0 rounded-full transition",
        checked ? "bg-blue-600" : "bg-slate-300",
      ].join(" ")}
    >
      <span
        className={[
          "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition",
          checked ? "left-[18px]" : "left-0.5",
        ].join(" ")}
      />
    </span>
  );
}
