import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Button,
  Card,
  Input,
} from "../../../../components/ui/index.ts";

import type {
  PermissionResponse,
  RoleResponse,
} from "../../../roles/types/role.ts";

import type {
  ModuleResponse,
} from "../../../module/types/module.ts";

import {
  useAssignPermissions,
} from "../../../roles/hooks/roleHooks";

interface Props {
  role: RoleResponse;
  permissions: PermissionResponse[];
  modules: ModuleResponse[];
}

interface PermissionGroup {
  moduleId: number;
  moduleName: string;
  permissions: PermissionResponse[];
}

export function RolePermissionManager({
  role,
  permissions,
  modules,
}: Props) {
  const [selectedIds, setSelectedIds] =
    useState<number[]>(
      role.permissions.map(
        (permission) => permission.id,
      ),
    );

  const [search, setSearch] = useState("");

  const mutation = useAssignPermissions();

  /*
   * =========================================================
   * RESET WHEN ROLE CHANGES
   * =========================================================
   */

  useEffect(() => {
    setSelectedIds(
      role.permissions.map(
        (permission) => permission.id,
      ),
    );

    setSearch("");
  }, [role]);

  /*
   * =========================================================
   * GROUP PERMISSIONS BY MODULE
   * =========================================================
   */

  const permissionGroups = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    const groups = new Map<
      number,
      PermissionGroup
    >();

    permissions.forEach((permission) => {
      /*
       * Search by permission code.
       */
      if (
        keyword &&
        !permission.code
          .toLowerCase()
          .includes(keyword)
      ) {
        return;
      }

      /*
       * Find the module using moduleId.
       */
      const module = modules.find(
        (item) =>
          item.id === permission.moduleId,
      );

      /*
       * If the module no longer exists,
       * don't display the permission.
       */
      if (!module) {
        return;
      }

      const existing =
        groups.get(module.id);

      if (existing) {
        existing.permissions.push(
          permission,
        );
      } else {
        groups.set(module.id, {
          moduleId: module.id,
          moduleName: module.name,
          permissions: [permission],
        });
      }
    });

    return Array.from(groups.values());
  }, [
    permissions,
    modules,
    search,
  ]);

  /*
   * =========================================================
   * TOGGLE SINGLE PERMISSION
   * =========================================================
   */

  const togglePermission = (
    permissionId: number,
  ) => {
    setSelectedIds((current) => {
      if (
        current.includes(permissionId)
      ) {
        return current.filter(
          (id) =>
            id !== permissionId,
        );
      }

      return [
        ...current,
        permissionId,
      ];
    });
  };

  /*
   * =========================================================
   * TOGGLE ALL PERMISSIONS IN MODULE
   * =========================================================
   */

  const toggleModule = (
    modulePermissions: PermissionResponse[],
  ) => {
    const permissionIds =
      modulePermissions.map(
        (permission) =>
          permission.id,
      );

    const allSelected =
      permissionIds.length > 0 &&
      permissionIds.every(
        (id) =>
          selectedIds.includes(id),
      );

    setSelectedIds((current) => {
      /*
       * If everything is already selected,
       * remove everything from this module.
       */
      if (allSelected) {
        return current.filter(
          (id) =>
            !permissionIds.includes(id),
        );
      }

      /*
       * Otherwise select everything.
       */
      return Array.from(
        new Set([
          ...current,
          ...permissionIds,
        ]),
      );
    });
  };

  /*
   * =========================================================
   * SAVE
   * =========================================================
   */

  const save = async () => {
    await mutation.mutateAsync({
      id: role.id,
      request: {
        permissionIds: selectedIds,
      },
    });
  };

  return (
    <Card className="w-full">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div>
        <h2 className="text-base font-semibold text-slate-900">
          Permissions
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Select the permissions assigned to this role.
        </p>
      </div>

      {/* =====================================================
          SEARCH
      ===================================================== */}

      <div className="mt-4">
        <Input
          placeholder="Search permission code..."
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value,
            )
          }
        />
      </div>

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-slate-500">
          {selectedIds.length} selected
        </p>

        <p className="text-xs text-slate-400">
          {permissions.length} permissions
        </p>
      </div>

      {/* =====================================================
          MODULES
      ===================================================== */}

      <div className="mt-3 max-h-[500px] space-y-2 overflow-y-auto pr-1">
        {permissionGroups.length ===
        0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center">
            <p className="text-sm text-slate-500">
              No permissions found.
            </p>
          </div>
        ) : (
          permissionGroups.map(
            (group) => (
              <ModulePermissionGroup
                key={group.moduleId}
                group={group}
                selectedIds={
                  selectedIds
                }
                onToggleModule={
                  toggleModule
                }
                onTogglePermission={
                  togglePermission
                }
              />
            ),
          )
        )}
      </div>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
        <p className="text-xs text-slate-500">
          {selectedIds.length}{" "}
          permissions selected
        </p>

        <Button
          onClick={() =>
            void save()
          }
          loading={
            mutation.isPending
          }
        >
          Save Permissions
        </Button>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {mutation.isError && (
        <p className="mt-3 text-sm text-red-600">
          Unable to update role
          permissions.
        </p>
      )}
    </Card>
  );
}

/*
 * ===========================================================
 * MODULE PERMISSION GROUP
 * ===========================================================
 */

interface ModulePermissionGroupProps {
  group: PermissionGroup;
  selectedIds: number[];

  onToggleModule: (
    permissions: PermissionResponse[],
  ) => void;

  onTogglePermission: (
    permissionId: number,
  ) => void;
}

function ModulePermissionGroup({
  group,
  selectedIds,
  onToggleModule,
  onTogglePermission,
}: ModulePermissionGroupProps) {
  /*
   * All permission IDs belonging
   * to this module.
   */
  const permissionIds =
    group.permissions.map(
      (permission) =>
        permission.id,
    );

  /*
   * Number of selected permissions.
   */
  const selectedCount =
    permissionIds.filter(
      (id) =>
        selectedIds.includes(id),
    ).length;

  /*
   * All selected.
   */
  const allSelected =
    permissionIds.length > 0 &&
    selectedCount ===
      permissionIds.length;

  /*
   * Some but not all selected.
   */
  const someSelected =
    selectedCount > 0 &&
    !allSelected;

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      {/* =====================================================
          MODULE HEADER
      ===================================================== */}

      <div className="flex items-center justify-between bg-slate-50 px-3 py-2">
        <label className="flex min-w-0 cursor-pointer items-center gap-2">
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
              onToggleModule(
                group.permissions,
              )
            }
            className="h-4 w-4 rounded border-slate-300"
          />

          <span className="truncate text-sm font-semibold text-slate-800">
            {group.moduleName}
          </span>
        </label>

        <span className="shrink-0 text-[11px] text-slate-400">
          {selectedCount}/
          {group.permissions.length}
        </span>
      </div>

      {/* =====================================================
          PERMISSIONS
      ===================================================== */}

      <div className="divide-y divide-slate-100">
        {group.permissions.map(
          (permission) => {
            const selected =
              selectedIds.includes(
                permission.id,
              );

            return (
              <label
                key={permission.id}
                className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() =>
                    onTogglePermission(
                      permission.id,
                    )
                  }
                  className="h-3.5 w-3.5 rounded border-slate-300"
                />

                <span className="font-mono text-xs text-slate-600">
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