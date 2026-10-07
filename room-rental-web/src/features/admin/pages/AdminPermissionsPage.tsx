import { useMemo, useState } from "react";

import {
  Button,
  EmptyState,
  LoadingState,
  Modal,
  PageHeader,
  Input,
} from "../../../components/ui";

import type {
  PermissionResponse,
  CreatePermissionRequest,
  UpdatePermissionRequest,
} from "../../permissions/types/permission";
import { Plus } from "../../../components/ui/MaterialIcon";
import { useModules, useCreateModule, useUpdateModule, useActivateModule, useDeactivateModule } from "../../module/hooks/moduleHooks";
import type { ModuleResponse } from "../../module/types/module";
import { useCreatePermission, useUpdatePermission, useActivatePermission, useDeactivatePermission, usePermissions } from "../../permissions/hooks/permissionHooks";
import { ModuleSection } from "../components/permissions/ModuleSection";
import { PermissionForm } from "../components/permissions/PermissionForm";
import { PermissionDraftForm } from "../components/permissions/PermissionDraftForm";

interface PermissionDraft {
  code: string;
  name: string;
  description: string;
}

type ModuleModal =
  | { type: "create" }
  | { type: "edit"; module: ModuleResponse }
  | null;

type PermissionModal =
  | { type: "create"; module: ModuleResponse }
  | { type: "edit"; permission: PermissionResponse }
  | null;

export default function AdminPermissionsPage() {
  const {
    data: modules,
    isLoading: modulesLoading,
    isError: modulesError,
    refetch: refetchModules,
  } = useModules();

  const {
    data: permissions,
    isLoading: permissionsLoading,
    isError: permissionsError,
    refetch: refetchPermissions,
  } = usePermissions();

  const createModule = useCreateModule();
  const updateModule = useUpdateModule();
  const activateModule = useActivateModule();
  const deactivateModule = useDeactivateModule();

  const createPermission = useCreatePermission();
  const updatePermission = useUpdatePermission();
  const activatePermission = useActivatePermission();
  const deactivatePermission = useDeactivatePermission();

  const [moduleModal, setModuleModal] =
    useState<ModuleModal>(null);

  const [permissionModal, setPermissionModal] =
    useState<PermissionModal>(null);

  const [moduleForm, setModuleForm] = useState({
    name: ""
  });

  const [permissionDrafts, setPermissionDrafts] =
    useState<PermissionDraft[]>([]);

  const [permissionForm, setPermissionForm] =
    useState<PermissionDraft>({
      code: "",
      name: "",
      description: "",
    });

  const loading =
    modulesLoading || permissionsLoading;

  const hasError =
    modulesError || permissionsError;

  const permissionsByModule = useMemo(() => {
    const map = new Map<number, PermissionResponse[]>();

    permissions?.forEach((permission) => {
      const current =
        map.get(permission.moduleId) ?? [];

      current.push(permission);

      map.set(permission.moduleId, current);
    });

    return map;
  }, [permissions]);

  const resetModuleForm = () => {
    setModuleForm({
      name: ""
    });

    setPermissionDrafts([]);
  };

  const openCreateModule = () => {
    resetModuleForm();
    setModuleModal({ type: "create" });
  };

  const openEditModule = (module: ModuleResponse) => {
    setModuleForm({
      name: module.name
    });

    setPermissionDrafts([]);

    setModuleModal({
      type: "edit",
      module,
    });
  };

  const closeModuleModal = () => {
    setModuleModal(null);
    resetModuleForm();
  };

  const addPermissionDraft = () => {
    setPermissionDrafts((current) => [
      ...current,
      {
        code: "",
        name: "",
        description: "",
      },
    ]);
  };

  const removePermissionDraft = (index: number) => {
    setPermissionDrafts((current) =>
      current.filter((_, i) => i !== index),
    );
  };

  const updatePermissionDraft = (
    index: number,
    field: keyof PermissionDraft,
    value: string,
  ) => {
    setPermissionDrafts((current) =>
      current.map((permission, i) =>
        i === index
          ? {
              ...permission,
              [field]: value,
            }
          : permission,
      ),
    );
  };

  const submitModule = async () => {
    const name = moduleForm.name.trim();

    if (!name) return;

    if (moduleModal?.type === "create") {
      const module = await createModule.mutateAsync({
        name
      });


      for (const permission of permissionDrafts) {
        if (!permission.code.trim() || !permission.name.trim()) {
          continue;
        }

        await createPermission.mutateAsync({
          code: permission.code.trim().toUpperCase(),
          name: permission.name.trim(),
          description:
            permission.description.trim() || undefined,
          moduleId: module.id,
        });
      }
    }

    if (moduleModal?.type === "edit") {
      await updateModule.mutateAsync({
        id: moduleModal.module.id,
        request: {
          name,
        },
      });
    }

    closeModuleModal();
  };

  const openCreatePermission = (
    module: ModuleResponse,
  ) => {
    setPermissionForm({
      code: "",
      name: "",
      description: "",
    });

    setPermissionModal({
      type: "create",
      module,
    });
  };

  const openEditPermission = (
    permission: PermissionResponse,
  ) => {
    setPermissionForm({
      code: permission.code,
      name: permission.name,
      description: permission.description ?? "",
    });

    setPermissionModal({
      type: "edit",
      permission,
    });
  };

  const closePermissionModal = () => {
    setPermissionModal(null);
  };

  const submitPermission = async () => {
    if (!permissionForm.code.trim()) return;
    if (!permissionForm.name.trim()) return;

    if (permissionModal?.type === "create") {
      const request: CreatePermissionRequest = {
        code: permissionForm.code.trim().toUpperCase(),
        name: permissionForm.name.trim(),
        description:
          permissionForm.description.trim() || undefined,
        moduleId: permissionModal.module.id,
      };

      await createPermission.mutateAsync(request);
    }

    if (permissionModal?.type === "edit") {
      const request: UpdatePermissionRequest = {
          code: permissionForm.code.trim().toUpperCase(),
          name: permissionForm.name.trim(),
          description: permissionForm.description.trim() || undefined,
          moduleId: permissionModal.permission.moduleId
      };

      await updatePermission.mutateAsync({
        id: permissionModal.permission.id,
        request,
      });
    }

    closePermissionModal();
  };

  const toggleModule = async (
    module: ModuleResponse,
  ) => {
    if (module.isActive) {
      await deactivateModule.mutateAsync(module.id);
    } else {
      await activateModule.mutateAsync(module.id);
    }
  };

  const togglePermission = async (
    permission: PermissionResponse,
  ) => {
    if (permission.isActive) {
      await deactivatePermission.mutateAsync(
        permission.id,
      );
    } else {
      await activatePermission.mutateAsync(
        permission.id,
      );
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (hasError) {
    return (
      <EmptyState
        title="Unable to load permissions"
        description="Something went wrong while loading modules and permissions."
        action={
          <Button
            variant="secondary"
            onClick={() => {
              void refetchModules();
              void refetchPermissions();
            }}
          >
            Try again
          </Button>
        }
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <PageHeader
        title="Permissions"
        description="Manage modules and their permissions. You can create modules, add permissions, and control access."
        actions={
          <Button
            leftIcon={<Plus size={17} />}
            onClick={openCreateModule}
          >
            Create module
          </Button>
        }
      />

      {!modules?.length ? (
        <EmptyState
          title="No modules found"
          description="Create a module to start defining permissions."
          action={
            <Button onClick={openCreateModule}>
              Create module
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {modules.map((module) => {
            const modulePermissions =
              permissionsByModule.get(module.id) ?? [];

            return (
              <ModuleSection
                key={module.id}
                module={module}
                permissions={modulePermissions}
                onEditModule={() =>
                  openEditModule(module)
                }
                onAddPermission={() =>
                  openCreatePermission(module)
                }
                onToggleModule={() =>
                  void toggleModule(module)
                }
                onEditPermission={
                  openEditPermission
                }
                onTogglePermission={
                  togglePermission
                }
              />
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODULE */}

      <Modal
        open={moduleModal !== null}
        onClose={closeModuleModal}
        title={
          moduleModal?.type === "edit"
            ? "Edit Module"
            : "Create Module"
        }
      >
        <div className="space-y-5">
          <Input
            label="Module name"
            requiredMark
            placeholder="e.g. Room Management"
            value={moduleForm.name}
            onChange={(event) =>
              setModuleForm((current) => ({
                ...current,
                name: event.target.value,
              }))
            }
          />

          {moduleModal?.type === "create" && (
            <div className="border-t pt-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Permissions
                  </h3>

                  <p className="text-xs text-slate-500">
                    You can add permissions now or later.
                  </p>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Plus size={14} />}
                  onClick={addPermissionDraft}
                >
                  Add permission
                </Button>
              </div>

              <div className="space-y-3">
                {permissionDrafts.map(
                  (permission, index) => (
                    <PermissionDraftForm
                      key={index}
                      permission={permission}
                      onChange={(field, value) =>
                        updatePermissionDraft(
                          index,
                          field,
                          value,
                        )
                      }
                      onRemove={() =>
                        removePermissionDraft(index)
                      }
                    />
                  ),
                )}

                {!permissionDrafts.length && (
                  <div className="rounded-lg border border-dashed border-slate-300 px-4 py-6 text-center">
                    <p className="text-sm text-slate-500">
                      No permissions added yet.
                    </p>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={addPermissionDraft}
                    >
                      Add your first permission
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {moduleModal?.type === "edit" && (
            <div className="border-t pt-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Permissions
                  </h3>

                  <p className="text-xs text-slate-500">
                    Add another permission to this module.
                  </p>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Plus size={14} />}
                  onClick={() =>
                    openCreatePermission(
                      moduleModal.module,
                    )
                  }
                >
                  Add permission
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 border-t pt-5">
            <Button
              variant="secondary"
              onClick={closeModuleModal}
            >
              Cancel
            </Button>

            <Button
              onClick={() => void submitModule()}
              loading={
                createModule.isPending ||
                updateModule.isPending ||
                createPermission.isPending
              }
            >
              {moduleModal?.type === "edit"
                ? "Save module"
                : "Create module"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* CREATE / EDIT PERMISSION */}

      <Modal
        open={permissionModal !== null}
        onClose={closePermissionModal}
        title={
          permissionModal?.type === "edit"
            ? "Edit Permission"
            : "Add Permission to Module"
        }
      >
        {permissionModal && (
          <PermissionForm
            permission={permissionForm}
            module={
              permissionModal.type === "create"
                ? permissionModal.module
                : undefined
            }
            editMode={
              permissionModal.type === "edit"
            }
            loading={
              createPermission.isPending ||
              updatePermission.isPending
            }
            onChange={(field, value) =>
              setPermissionForm((current) => ({
                ...current,
                [field]: value,
              }))
            }
            onCancel={closePermissionModal}
            onSubmit={() =>
              void submitPermission()
            }
          />
        )}
      </Modal>
    </div>
  );
}