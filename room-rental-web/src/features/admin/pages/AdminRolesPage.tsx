import { useMemo, useState } from "react";

import {
  Button,
  EmptyState,
  Input,
  LoadingState,
  Modal,
  PageHeader,
  Textarea,
} from "../../../components/ui";

import { Plus } from "../../../components/ui/MaterialIcon";

import type {
  RoleResponse,
  CreateRoleRequest,
  UpdateRoleRequest,
} from "../../roles/types/role";

import {
  useRoles,
  useCreateRole,
  useUpdateRole,
  useActivateRole,
  useDeactivateRole,
  useAssignPermissions,
} from "../../roles/hooks/roleHooks";

import { usePermissions } from "../../permissions/hooks/permissionHooks";

import type { PermissionResponse } from "../../permissions/types/permission";

import { useModules } from "../../module/hooks/moduleHooks";

import type { ModuleResponse } from "../../module/types/module";

import { RoleCard } from "../components/roles/RoleCard";
import { PermissionModal } from "../components/roles/PermissionModal";
import { ModulePermissionGroup } from "../components/roles/ModulePermissionGroup";




type RoleModal =
  | {
      type: "create";
    }
  | {
      type: "edit";
      role: RoleResponse;
    }
  | null;

type PermissionModalState =
  | {
      type: "permissions";
      role: RoleResponse;
    }
  | null;

interface RoleForm {
  code: string;
  name: string;
  description: string;
}

interface PermissionGroup {
  moduleId: number;
  moduleName: string;
  permissions: PermissionResponse[];
}





export default function AdminRolesPage() {

  const {
    data: roles,
    isLoading: rolesLoading,
    isError: rolesError,
    refetch: refetchRoles,
  } = useRoles();

  const {
    data: permissions,
    isLoading: permissionsLoading,
  } = usePermissions();

  const {
    data: modules,
    isLoading: modulesLoading,
  } = useModules();


  /*
   * ----------------------------------------------------------
   * MUTATIONS
   * ----------------------------------------------------------
   */

  const createRole = useCreateRole();

  const updateRole = useUpdateRole();

  const activateRole = useActivateRole();

  const deactivateRole = useDeactivateRole();

  const assignPermissions =
    useAssignPermissions();


  /*
   * ----------------------------------------------------------
   * STATE
   * ----------------------------------------------------------
   */

  const [roleModal, setRoleModal] =
    useState<RoleModal>(null);

  const [permissionModal, setPermissionModal] =
    useState<PermissionModalState>(null);

  const [roleForm, setRoleForm] =
    useState<RoleForm>({
      code: "",
      name: "",
      description: "",
    });

  const [
    selectedPermissionIds,
    setSelectedPermissionIds,
  ] = useState<number[]>([]);

  const [permissionSearch, setPermissionSearch] =
    useState("");


  /*
   * ----------------------------------------------------------
   * LOADING
   * ----------------------------------------------------------
   */

  const loading =
    rolesLoading ||
    permissionsLoading ||
    modulesLoading;


  /*
   * ==========================================================
   * ROLE FORM
   * ==========================================================
   */

  const resetRoleForm = () => {
    setRoleForm({
      code: "",
      name: "",
      description: "",
    });
  };


  const openCreateRole = () => {
    resetRoleForm();

    setRoleModal({
      type: "create",
    });
  };


  const openEditRole = (
    role: RoleResponse,
  ) => {
    setRoleForm({
      code: role.code,
      name: role.name,
      description:
        role.description ?? "",
    });

    setRoleModal({
      type: "edit",
      role,
    });
  };


  const closeRoleModal = () => {
    setRoleModal(null);
    resetRoleForm();
  };


  /*
   * ==========================================================
   * CREATE / UPDATE ROLE
   * ==========================================================
   */

  const submitRole = async () => {
    const code =
      roleForm.code.trim();

    const name =
      roleForm.name.trim();

    const description =
      roleForm.description.trim();

    /*
     * Name is required.
     */
    if (!name) {
      return;
    }


    /*
     * --------------------------------------------------------
     * CREATE
     * --------------------------------------------------------
     */

    if (
      roleModal?.type === "create"
    ) {
      const request: CreateRoleRequest = {
        code: code.toUpperCase(),
        name,
        description:
          description || undefined,
        permissionIds: [],
      };

      await createRole.mutateAsync(
        request,
      );

      closeRoleModal();

      return;
    }


    /*
     * --------------------------------------------------------
     * UPDATE
     * --------------------------------------------------------
     */

    if (
      roleModal?.type === "edit"
    ) {
      const request: UpdateRoleRequest = {
        name,
        description:
          description || undefined,
      };

      await updateRole.mutateAsync({
        id: roleModal.role.id,
        request,
      });

      closeRoleModal();
    }
  };


  /*
   * ==========================================================
   * ROLE STATUS
   * ==========================================================
   */

  const toggleRole = async (
    role: RoleResponse,
  ) => {
    if (role.isActive) {
      await deactivateRole.mutateAsync(
        role.id,
      );
    } else {
      await activateRole.mutateAsync(
        role.id,
      );
    }
  };


  /*
   * ==========================================================
   * PERMISSION MODAL
   * ==========================================================
   */

  const openPermissionModal = (
    role: RoleResponse,
  ) => {
    setSelectedPermissionIds(
      role.permissions.map(
        (permission) =>
          permission.id,
      ),
    );

    setPermissionSearch("");

    setPermissionModal({
      type: "permissions",
      role,
    });
  };


  const closePermissionModal = () => {
    setPermissionModal(null);

    setSelectedPermissionIds([]);

    setPermissionSearch("");
  };


  /*
   * ==========================================================
   * TOGGLE SINGLE PERMISSION
   * ==========================================================
   */

  const togglePermission = (
    permissionId: number,
  ) => {
    setSelectedPermissionIds(
      (current) => {
        if (
          current.includes(
            permissionId,
          )
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
      },
    );
  };


  /*
   * ==========================================================
   * TOGGLE MODULE
   * ==========================================================
   */

  const toggleModule = (
    group: PermissionGroup,
  ) => {
    const permissionIds =
      group.permissions.map(
        (permission) =>
          permission.id,
      );

    const allSelected =
      permissionIds.length > 0 &&
      permissionIds.every((id) =>
        selectedPermissionIds.includes(
          id,
        ),
      );


    setSelectedPermissionIds(
      (current) => {
        /*
         * If everything is selected,
         * remove all permissions from
         * this module.
         */
        if (allSelected) {
          return current.filter(
            (id) =>
              !permissionIds.includes(
                id,
              ),
          );
        }


        /*
         * Otherwise select every
         * permission in this module.
         */
        return Array.from(
          new Set([
            ...current,
            ...permissionIds,
          ]),
        );
      },
    );
  };


  /*
   * ==========================================================
   * SAVE PERMISSIONS
   * ==========================================================
   *
   * Empty permissionIds is allowed.
   */

  const savePermissions = async () => {
    if (
      permissionModal?.type !==
      "permissions"
    ) {
      return;
    }

    await assignPermissions.mutateAsync({
      id: permissionModal.role.id,
      request: {
        permissionIds:
          selectedPermissionIds,
      },
    });

    closePermissionModal();
  };


  /*
   * ==========================================================
   * GROUP PERMISSIONS BY MODULE
   * ==========================================================
   *
   * PermissionResponse has:
   *
   *   moduleId
   *
   * but does NOT have:
   *
   *   moduleName
   *
   * So we resolve the module name
   * using the modules API.
   */

  const permissionGroups =
    useMemo(() => {
      const keyword =
        permissionSearch
          .trim()
          .toLowerCase();

      const groups =
        new Map<
          number,
          PermissionGroup
        >();


      (
        permissions ?? []
      ).forEach((permission) => {
        /*
         * Search only by permission code.
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
         * Find the module.
         */
        const module =
          (
            modules ?? []
          ).find(
            (
              item: ModuleResponse,
            ) =>
              item.id ===
              permission.moduleId,
          );


        /*
         * If the module doesn't exist,
         * skip this permission.
         */
        if (!module) {
          return;
        }


        /*
         * Existing group.
         */
        const existing =
          groups.get(module.id);

        if (existing) {
          existing.permissions.push(
            permission,
          );

          return;
        }


        /*
         * New group.
         */
        groups.set(
          module.id,
          {
            moduleId: module.id,
            moduleName: module.name,
            permissions: [
              permission,
            ],
          },
        );
      });


      return Array.from(
        groups.values(),
      );
    }, [
      permissions,
      modules,
      permissionSearch,
    ]);


  /*
   * ==========================================================
   * LOADING
   * ==========================================================
   */

  if (loading) {
    return <LoadingState />;
  }


  /*
   * ==========================================================
   * ERROR
   * ==========================================================
   */

  if (rolesError) {
    return (
      <EmptyState
        title="Unable to load roles"
        description="Something went wrong while loading roles."
        action={
          <Button
            variant="secondary"
            onClick={() => {
              void refetchRoles();
            }}
          >
            Try again
          </Button>
        }
      />
    );
  }


  /*
   * ==========================================================
   * PAGE UI
   * ==========================================================
   */

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">

      {/* ====================================================
          PAGE HEADER
      ==================================================== */}

      <PageHeader
        title="Roles"
        description="Manage roles and control the permissions assigned to each role."
        actions={
          <Button
            leftIcon={<Plus size={17} />}
            onClick={openCreateRole}
          >
            Create role
          </Button>
        }
      />


      {/* ====================================================
          ROLE LIST
      ==================================================== */}

      {!roles?.length ? (
        <EmptyState
          title="No roles found"
          description="Create a role to start managing access."
          action={
            <Button
              onClick={openCreateRole}
            >
              Create role
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {roles.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              onEdit={() =>
                openEditRole(role)
              }
              onPermissions={() =>
                openPermissionModal(
                  role,
                )
              }
              onToggle={() =>
                void toggleRole(
                  role,
                )
              }
            />
          ))}
        </div>
      )}


      {/* ====================================================
          CREATE / EDIT ROLE
          Uses your existing Modal.
      ==================================================== */}

      <Modal
        open={roleModal !== null}
        onClose={closeRoleModal}
        title={
          roleModal?.type === "edit"
            ? "Edit Role"
            : "Create Role"
        }
        description={
          roleModal?.type === "edit"
            ? "Update the role information."
            : "Create a role that can be assigned permissions."
        }
      >
        <div className="space-y-5">

          {/* Role code */}
          {roleModal?.type ===
            "create" && (
            <Input
              label="Role code"
              requiredMark
              placeholder="ROOM_MANAGER"
              value={roleForm.code}
              onChange={(event) =>
                setRoleForm(
                  (current) => ({
                    ...current,
                    code: event.target.value.toUpperCase(),
                  }),
                )
              }
            />
          )}


          {/* Role name */}
          <Input
            label="Role name"
            requiredMark
            placeholder="Room Manager"
            value={roleForm.name}
            onChange={(event) =>
              setRoleForm(
                (current) => ({
                  ...current,
                  name: event.target.value,
                }),
              )
            }
          />


          {/* Description */}
          <Textarea
            label="Description"
            placeholder="Manages rooms and room availability."
            value={
              roleForm.description
            }
            onChange={(event) =>
              setRoleForm(
                (current) => ({
                  ...current,
                  description:
                    event.target.value,
                }),
              )
            }
          />


          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">

            <Button
              variant="secondary"
              onClick={
                closeRoleModal
              }
              disabled={
                createRole.isPending ||
                updateRole.isPending
              }
            >
              Cancel
            </Button>

            <Button
              onClick={() =>
                void submitRole()
              }
              loading={
                createRole.isPending ||
                updateRole.isPending
              }
            >
              {roleModal?.type ===
              "edit"
                ? "Save changes"
                : "Create role"}
            </Button>

          </div>
        </div>
      </Modal>


      <PermissionModal
        open={
          permissionModal !== null
        }
        title={
          permissionModal?.type ===
          "permissions"
            ? `Manage Permissions · ${permissionModal.role.name}`
            : "Manage Permissions"
        }
        onClose={
          closePermissionModal
        }
        onSave={() =>
          void savePermissions()
        }
        saving={
          assignPermissions.isPending
        }
      >

        <div className="space-y-4">

          {/* Search */}
          <Input
            label="Search permission"
            placeholder="Search permission code..."
            value={
              permissionSearch
            }
            onChange={(event) =>
              setPermissionSearch(
                event.target.value,
              )
            }
          />


          {/* Summary */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {selectedPermissionIds.length}{" "}
              selected
            </p>

            <p className="text-xs text-slate-400">
              {permissionGroups.reduce(
                (
                  total,
                  group,
                ) =>
                  total +
                  group.permissions
                    .length,
                0,
              )}{" "}
              permissions
            </p>
          </div>


          {/* Permission groups */}
          {permissionGroups.length ===
          0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 px-5 py-12 text-center">
              <p className="text-sm text-slate-500">
                No permissions found.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {permissionGroups.map(
                (group) => (
                  <ModulePermissionGroup
                    key={
                      group.moduleId
                    }
                    group={group}
                    selectedPermissionIds={
                      selectedPermissionIds
                    }
                    onToggleModule={
                      toggleModule
                    }
                    onTogglePermission={
                      togglePermission
                    }
                  />
                ),
              )}
            </div>
          )}


          {/* Error */}
          {assignPermissions.isError && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              Unable to update role
              permissions. Please try
              again.
            </div>
          )}

        </div>

      </PermissionModal>
    </div>
  );
}