import type { PermissionResponse } from "../../../permissions/types/permission";

interface PermissionGroup {
  moduleId: number;
  moduleName: string;
  permissions: PermissionResponse[];
}

interface ModulePermissionGroupProps {
  group: PermissionGroup;
  selectedPermissionIds: number[];
  onToggleModule: (
    group: PermissionGroup,
  ) => void;
  onTogglePermission: (
    permissionId: number,
  ) => void;
}

export function ModulePermissionGroup({
  group,
  selectedPermissionIds,
  onToggleModule,
  onTogglePermission,
}: ModulePermissionGroupProps) {
  const permissionIds =
    group.permissions.map(
      (permission) => permission.id,
    );

  const selectedCount =
    permissionIds.filter((id) =>
      selectedPermissionIds.includes(id),
    ).length;

  const allSelected =
    permissionIds.length > 0 &&
    selectedCount === permissionIds.length;

  const someSelected =
    selectedCount > 0 &&
    selectedCount < permissionIds.length;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {/* Module header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
        <label className="flex min-w-0 cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={allSelected}
            ref={(element) => {
              if (element) {
                element.indeterminate =
                  someSelected;
              }
            }}
            onChange={() =>
              onToggleModule(group)
            }
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              {group.moduleName}
            </p>

            <p className="text-xs text-slate-500">
              {group.permissions.length}{" "}
              permissions
            </p>
          </div>
        </label>

        {/* Selected count */}
        <span className="shrink-0 text-xs font-medium text-slate-500">
          {selectedCount}/{group.permissions.length}
        </span>
      </div>

      {/* Permission list */}
      <div className="divide-y divide-slate-100">
        {group.permissions.map(
          (permission) => {
            const selected =
              selectedPermissionIds.includes(
                permission.id,
              );

            return (
              <label
                key={permission.id}
                className="flex cursor-pointer items-center gap-3 px-4 py-2.5 transition hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() =>
                    onTogglePermission(
                      permission.id,
                    )
                  }
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />

                <span
                  className={
                    selected
                      ? "font-mono text-xs font-semibold text-blue-600"
                      : "font-mono text-xs text-slate-600"
                  }
                >
                  {permission.code}
                </span>
              </label>
            );
          },
        )}
      </div>
    </div>
  );
}