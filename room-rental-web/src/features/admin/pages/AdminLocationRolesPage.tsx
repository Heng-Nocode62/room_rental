import { useMemo, useState, type FormEvent } from "react";

import {
  Button,
  Badge,
  EmptyState,
  Input,
  LoadingState,
  Modal,
  PageHeader,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "../../../components/ui";

import {
  MapPin,
  Plus,
  ShieldCheck,
  Trash2,
  Edit3,
} from "../../../components/ui/MaterialIcon.tsx";

import { useLocations } from "../../locations/hooks/useLocations";
import { useUsers } from "../../users/hooks/useUsers";
import { useRoles } from "../../roles/hooks/roleHooks";

import {
  useUserLocationRolesByLocation,
} from "../../user-location-roles/hooks/useUserLocationRolesByLocation";

import {
  useCreateUserLocationRole,
} from "../../user-location-roles/hooks/useCreateUserLocationRole";

import {
  useUpdateUserLocationRole,
} from "../../user-location-roles/hooks/useUpdateUserLocationRole";

import {
  useDeleteUserLocationRole,
} from "../../user-location-roles/hooks/useDeleteUserLocationRole";

import type {
  UserLocationRoleResponse,
} from "../../user-location-roles/types/userLocationRole";

export default function AdminUserLocationRolesPage() {
  // Filters
  const [locationId, setLocationId] = useState("");
  const [keyword, setKeyword] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // Assignment form
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] =
    useState<UserLocationRoleResponse | null>(null);

  const [formUserId, setFormUserId] = useState("");
  const [formRoleId, setFormRoleId] = useState("");
  const [formError, setFormError] = useState("");

  // Delete confirmation
  const [removeTarget, setRemoveTarget] =
    useState<UserLocationRoleResponse | null>(null);
  const [removeError, setRemoveError] = useState("");

  // Queries
  const locations = useLocations();

  const users = useUsers({
    page: 0,
    size: 200,
    sort: "username,asc",
  });

  const roles = useRoles();

  const numericLocationId = locationId
    ? Number(locationId)
    : undefined;

  const assignments = useUserLocationRolesByLocation(
    numericLocationId,
  );

  // Mutations
  const create = useCreateUserLocationRole();
  const update = useUpdateUserLocationRole();
  const remove = useDeleteUserLocationRole();

  // Lookup maps for displaying readable names instead of numeric IDs.
  const usersById = useMemo(
    () =>
      new Map(
        (users.data?.content ?? []).map((user) => [
          user.id,
          user,
        ]),
      ),
    [users.data?.content],
  );

  const rolesById = useMemo(
    () =>
      new Map(
        (roles.data ?? []).map((role) => [
          role.id,
          role,
        ]),
      ),
    [roles.data],
  );

  const activeRoles = useMemo(
    () => (roles.data ?? []).filter((role) => role.isActive),
    [roles.data],
  );

  const visibleAssignments = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    return (assignments.data ?? []).filter((assignment) => {
      const user = usersById.get(assignment.userId);

      const name = `${user?.firstName ?? ""} ${
        user?.lastName ?? ""
      }`.trim();

      const searchable = [
        name,
        user?.username,
        user?.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesKeyword =
        !search || searchable.includes(search);

      const matchesRole =
        !roleFilter ||
        String(assignment.roleId) === roleFilter;

      return matchesKeyword && matchesRole;
    });
  }, [
    assignments.data,
    usersById,
    keyword,
    roleFilter,
  ]);

  const resetMutations = () => {
    create.reset();
    update.reset();
  };

  const closeForm = () => {
    setFormOpen(false);
    setSelected(null);
    setFormUserId("");
    setFormRoleId("");
    setFormError("");
    resetMutations();
  };

  const openCreate = () => {
    resetMutations();
    setSelected(null);
    setFormUserId("");
    setFormRoleId("");
    setFormError("");
    setFormOpen(true);
  };

  const openEdit = (
    assignment: UserLocationRoleResponse,
  ) => {
    resetMutations();
    setSelected(assignment);
    setFormUserId(String(assignment.userId));
    setFormRoleId(String(assignment.roleId));
    setFormError("");
    setFormOpen(true);
  };

  const submit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setFormError("");

    if (!numericLocationId) {
      setFormError("Please select a location.");
      return;
    }

    const userId = Number(formUserId);
    const roleId = Number(formRoleId);

    if (
      !Number.isInteger(userId) ||
      userId <= 0 ||
      !Number.isInteger(roleId) ||
      roleId <= 0
    ) {
      setFormError("Select a valid user and role.");
      return;
    }

    // Prevent duplicate user + location + role assignments.
    const duplicate = (assignments.data ?? []).some(
      (assignment) =>
        assignment.id !== selected?.id &&
        assignment.userId === userId &&
        assignment.locationId === numericLocationId &&
        assignment.roleId === roleId,
    );

    if (duplicate) {
      setFormError(
        "This user already has this role at the selected location.",
      );
      return;
    }

    try {
      if (selected) {
        await update.mutateAsync({
          id: selected.id,
          request: {
            userId: selected.userId,
            locationId: numericLocationId,
            roleId,
          },
        });
      } else {
        await create.mutateAsync({
          userId,
          locationId: numericLocationId,
          roleId,
        });
      }

      closeForm();
    } catch (error) {
      console.error(
        "Unable to save the user location role:",
        error,
      );

      setFormError(
        "Unable to save the assignment. Please try again.",
      );
    }
  };

  const confirmRemove = async () => {
    if (!removeTarget) return;

    setRemoveError("");

    try {
      await remove.mutateAsync(removeTarget.id);
      setRemoveTarget(null);
    } catch (error) {
      console.error(
        "Unable to remove the assignment:",
        error,
      );

      setRemoveError(
        "Unable to remove the assignment. Please try again.",
      );
    }
  };

  const clearFilters = () => {
    setKeyword("");
    setRoleFilter("");
  };

  // Initial resource loading
  if (locations.isLoading) {
    return <LoadingState />;
  }

  if (locations.isError) {
    return (
      <EmptyState
        title="Unable to load locations"
        description="Something went wrong while loading locations."
        action={
          <Button
            variant="secondary"
            onClick={() => void locations.refetch()}
          >
            Try again
          </Button>
        }
      />
    );
  }

  const locationOptions = (locations.data ?? []).map(
    (location) => ({
      label: `${location.name} (${location.code})${
        location.status === "ACTIVE" ? "" : " · Inactive"
      }`,
      value: String(location.id),
    }),
  );

  const selectedLocation = (locations.data ?? []).find(
    (location) => String(location.id) === locationId,
  );

  const isSaving = create.isPending || update.isPending;

  const getStatusVariant = (
    status?: string,
  ): "success" | "warning" | "danger" | "neutral" => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "success";
      case "INACTIVE":
        return "warning";
      case "LOCKED":
        return "danger";
      default:
        return "neutral";
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6">
      <PageHeader
        icon={<ShieldCheck size={19} />}
        title="User Location Roles"
        description="Manage user access and roles across your locations."
        actions={
          <Button
            leftIcon={<Plus size={17} />}
            onClick={openCreate}
            disabled={!numericLocationId}
          >
            Assign role
          </Button>
        }
      />

      {/* Location selector */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <MapPin size={19} />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Select location
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                View assignments for one location at a time.
              </p>
            </div>
          </div>

          <Select
            aria-label="Select location"
            value={locationId}
            onChange={(event) => {
              setLocationId(event.target.value);
              setKeyword("");
              setRoleFilter("");
              setRemoveTarget(null);
              setRemoveError("");
              closeForm();
            }}
            options={[
              {
                label: "Choose a location",
                value: "",
              },
              ...locationOptions,
            ]}
          />
        </div>
      </div>

      {/* Search and role filters */}
      {numericLocationId && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_240px_auto] sm:items-end">
            <Input
              label="Search users"
              placeholder="Name, username, or email..."
              value={keyword}
              onChange={(event) =>
                setKeyword(event.target.value)
              }
            />

            <Select
              label="Filter by role"
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(event.target.value)
              }
              options={[
                { label: "All roles", value: "" },
                ...(roles.data ?? []).map((role) => ({
                  label: role.name,
                  value: String(role.id),
                })),
              ]}
            />

            {(keyword || roleFilter) && (
              <Button
                variant="secondary"
                onClick={clearFilters}
              >
                Clear filters
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Assignment list */}
      {!numericLocationId ? (
        <EmptyState
          title="Select a location"
          description="Choose a location above to view and manage its user-role assignments."
        />
      ) : assignments.isLoading ||
        users.isLoading ||
        roles.isLoading ? (
        <LoadingState />
      ) : assignments.isError ||
        users.isError ||
        roles.isError ? (
        <EmptyState
          title="Unable to load assignments"
          description="Something went wrong while loading users, roles, or assignments."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                void assignments.refetch();
                void users.refetch();
                void roles.refetch();
              }}
            >
              Try again
            </Button>
          }
        />
      ) : visibleAssignments.length === 0 ? (
        <EmptyState
          title={
            (assignments.data ?? []).length === 0
              ? "No assignments yet"
              : "No matching assignments"
          }
          description={
            (assignments.data ?? []).length === 0
              ? `No users have been assigned roles at ${selectedLocation?.name ?? "this location"}.`
              : "Try another search or role filter."
          }
          action={
            (assignments.data ?? []).length === 0 ? (
              <Button
                leftIcon={<Plus size={16} />}
                onClick={openCreate}
              >
                Assign role
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={clearFilters}
              >
                Clear filters
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Assignments
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {selectedLocation?.name}
              </p>
            </div>

            <Badge variant="neutral">
              {visibleAssignments.length}{" "}
              {visibleAssignments.length === 1
                ? "assignment"
                : "assignments"}
            </Badge>
          </div>

          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>User</TableHeaderCell>
                <TableHeaderCell>Role</TableHeaderCell>
                <TableHeaderCell>Account status</TableHeaderCell>
                <TableHeaderCell align="right">
                  Actions
                </TableHeaderCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {visibleAssignments.map((assignment) => {
                const user = usersById.get(assignment.userId);
                const role = rolesById.get(assignment.roleId);

                const name = user
                  ? `${user.firstName} ${user.lastName}`.trim()
                  : `User #${assignment.userId}`;

                const initials = name
                  .split(/\s+/)
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part[0].toUpperCase())
                  .join("");

                return (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      <div className="flex min-w-[200px] items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-700">
                          {initials || "U"}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-900">
                            {name}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-slate-500">
                            {user?.email ??
                              (user?.username
                                ? `@${user.username}`
                                : "User information unavailable")}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          role?.isActive ? "info" : "warning"
                        }
                      >
                        {role?.name ??
                          `Role #${assignment.roleId}`}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={getStatusVariant(user?.status)}
                      >
                        {user?.status ?? "Unknown"}
                      </Badge>
                    </TableCell>

                    <TableCell align="right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          leftIcon={<Edit3 size={15} />}
                          onClick={() => openEdit(assignment)}
                        >
                          Edit
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          leftIcon={<Trash2 size={15} />}
                          onClick={() => {
                            setRemoveTarget(assignment);
                            setRemoveError("");
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create / edit assignment */}
      <Modal
        open={formOpen}
        onClose={closeForm}
        title={selected ? "Edit assignment" : "Assign a role"}
        description={
          selected
            ? "Change this user's role at the selected location."
            : "Choose a user and assign a role at the selected location."
        }
        size="md"
      >
        <form onSubmit={submit} className="space-y-5">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
            <p className="text-xs font-medium text-slate-500">
              Location
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {selectedLocation?.name}
            </p>
          </div>

          <Select
            label="User"
            requiredMark
            value={formUserId}
            onChange={(event) =>
              setFormUserId(event.target.value)
            }
            disabled={!!selected || isSaving}
            options={[
              {
                label: "Select a user",
                value: "",
              },
              ...(users.data?.content ?? []).map((user) => ({
                label: `${user.firstName} ${user.lastName} (@${user.username})`,
                value: String(user.id),
              })),
            ]}
          />

          <Select
            label="Role"
            requiredMark
            value={formRoleId}
            onChange={(event) =>
              setFormRoleId(event.target.value)
            }
            disabled={isSaving}
            options={[
              {
                label: "Select a role",
                value: "",
              },
              ...[
                ...activeRoles,
                ...(selected
                  ? (roles.data ?? []).filter(
                      (role) =>
                        role.id === selected.roleId &&
                        !role.isActive,
                    )
                  : []),
              ].map((role) => ({
                label: role.isActive
                  ? role.name
                  : `${role.name} · Inactive`,
                value: String(role.id),
              })),
            ]}
          />

          {formError && (
            <p role="alert" className="text-sm text-rose-600">
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={closeForm}
              disabled={isSaving}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              loading={isSaving}
              disabled={!formUserId || !formRoleId}
            >
              {selected ? "Save changes" : "Create assignment"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm deletion */}
      <Modal
        open={removeTarget !== null}
        onClose={() => {
          if (!remove.isPending) {
            setRemoveTarget(null);
            setRemoveError("");
          }
        }}
        title="Remove assignment"
        description="This removes the user's role at this location, not their user account."
        size="sm"
      >
        {removeTarget && (
          <div className="space-y-4">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              {(() => {
                const user = usersById.get(removeTarget.userId);
                const role = rolesById.get(removeTarget.roleId);

                return (
                  <>
                    Remove{" "}
                    <strong>
                      {user
                        ? `${user.firstName} ${user.lastName}`
                        : `User #${removeTarget.userId}`}
                    </strong>
                    {"'s "}
                    <strong>
                      {role?.name ??
                        `Role #${removeTarget.roleId}`}
                    </strong>
                    {" assignment at "}
                    <strong>{selectedLocation?.name}</strong>?
                  </>
                );
              })()}
            </div>

            {removeError && (
              <p role="alert" className="text-sm text-rose-600">
                {removeError}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setRemoveTarget(null);
                  setRemoveError("");
                }}
                disabled={remove.isPending}
              >
                Cancel
              </Button>

              <Button
                variant="danger"
                onClick={() => void confirmRemove()}
                loading={remove.isPending}
              >
                Remove assignment
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}