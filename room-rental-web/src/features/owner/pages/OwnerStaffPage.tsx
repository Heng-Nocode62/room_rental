import { useMemo, useState, type FormEvent } from "react";

import {
  Badge,
  Button,
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
  Edit3,
  MapPin,
  Plus,
  Trash2,
  Users,
} from "../../../components/ui/MaterialIcon.tsx";

import { useCurrentUser } from "../../auth/hooks/useCurrentUser";
import { useUsers } from "../../users/hooks/useUsers";
import { useLocationScope } from "../../location-scope/LocationScopeProvider";

import { useRoles } from "../../roles/hooks/roleHooks";

import { useUserLocationRolesByLocation } from "../../user-location-roles/hooks/useUserLocationRolesByLocation";
import { useCreateUserLocationRole } from "../../user-location-roles/hooks/useCreateUserLocationRole";
import { useUpdateUserLocationRole } from "../../user-location-roles/hooks/useUpdateUserLocationRole";
import { useDeleteUserLocationRole } from "../../user-location-roles/hooks/useDeleteUserLocationRole";

import type { UserLocationRoleResponse } from "../../user-location-roles/types/userLocationRole";

export default function OwnerStaffPage() {
  const scope = useLocationScope();
  const { data: me } = useCurrentUser();

  const locationId = scope.currentLocationId;
  const currentLocation = scope.currentLocation;

  const assignments = useUserLocationRolesByLocation(
    locationId ?? undefined,
  );

  const users = useUsers({
    page: 0,
    size: 200,
    sort: "username,asc",
  });

  const roles = useRoles();

  const create = useCreateUserLocationRole();
  const update = useUpdateUserLocationRole();
  const remove = useDeleteUserLocationRole();

  const [keyword, setKeyword] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [open, setOpen] = useState(false);
  const [selected, setSelected] =
    useState<UserLocationRoleResponse | null>(null);

  const [formUserId, setFormUserId] = useState("");
  const [formRoleId, setFormRoleId] = useState("");

  const [removeTarget, setRemoveTarget] =
    useState<UserLocationRoleResponse | null>(null);

  const [mutationError, setMutationError] = useState("");

  // Roles available for assignment.
  // Owners must not be able to assign administrative roles.
  const assignableRoles = useMemo(
    () =>
      (roles.data ?? []).filter(
        (role) =>
          role.isActive !== false &&
          !["ADMIN", "SUPER_ADMIN", "SHOP_OWNER", "OWNER"].includes(
            role.code.toUpperCase(),
          ),
      ),
    [roles.data],
  );

  const usersById = useMemo(
    () => new Map((users.data?.content ?? []).map((user) => [user.id, user])),
    [users.data?.content],
  );

  const rolesById = useMemo(
    () => new Map((roles.data ?? []).map((role) => [role.id, role])),
    [roles.data],
  );

  const locationAssignments = useMemo(
    () => (assignments.data ?? []).filter((item) => item.userId !== me?.id),
    [assignments.data, me?.id],
  );

  const visibleAssignments = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return locationAssignments.filter((assignment) => {
      const user = usersById.get(assignment.userId);

      const searchableText = [
        user?.firstName,
        user?.lastName,
        user?.username,
        user?.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesKeyword =
        !normalizedKeyword || searchableText.includes(normalizedKeyword);

      const matchesRole =
        !roleFilter || String(assignment.roleId) === roleFilter;

      return matchesKeyword && matchesRole;
    });
  }, [locationAssignments, usersById, keyword, roleFilter]);

  const closeForm = () => {
    setOpen(false);
    setSelected(null);
    setFormUserId("");
    setFormRoleId("");
    setMutationError("");

    create.reset();
    update.reset();
  };

  const openCreate = () => {
    create.reset();
    update.reset();

    setSelected(null);
    setFormUserId("");
    setFormRoleId("");
    setMutationError("");
    setOpen(true);
  };

  const openEdit = (assignment: UserLocationRoleResponse) => {
    create.reset();
    update.reset();

    setSelected(assignment);
    setFormUserId(String(assignment.userId));
    setFormRoleId(String(assignment.roleId));
    setMutationError("");
    setOpen(true);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMutationError("");

    if (!locationId || !formUserId || !formRoleId) {
      setMutationError("Please select a user and a role.");
      return;
    }

    const userId = Number(formUserId);
    const roleId = Number(formRoleId);

    if (!Number.isInteger(userId) || userId <= 0) {
      setMutationError("Please select a valid user.");
      return;
    }

    if (!Number.isInteger(roleId) || roleId <= 0) {
      setMutationError("Please select a valid role.");
      return;
    }

    // Prevent an exact duplicate assignment at this location.
    const duplicate = (assignments.data ?? []).some(
      (assignment) =>
        assignment.id !== selected?.id &&
        assignment.userId === userId &&
        assignment.locationId === locationId &&
        assignment.roleId === roleId,
    );

    if (duplicate) {
      setMutationError(
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
            locationId,
            roleId,
          },
        });
      } else {
        await create.mutateAsync({
          userId,
          locationId,
          roleId,
        });
      }

      closeForm();
    } catch (error) {
      console.error("Unable to save user location role:", error);
      setMutationError(
        "Unable to save this assignment. Please try again.",
      );
    }
  };

  const confirmRemove = async () => {
    if (!removeTarget) return;

    try {
      await remove.mutateAsync(removeTarget.id);
      setRemoveTarget(null);
      setMutationError("");
    } catch (error) {
      console.error("Unable to remove assignment:", error);
      setMutationError(
        "Unable to remove this assignment. Please try again.",
      );
    }
  };

  const clearFilters = () => {
    setKeyword("");
    setRoleFilter("");
  };

  const retryLoading = () => {
    void Promise.all([
      assignments.refetch(),
      users.refetch(),
      roles.refetch(),
    ]);
  };

  if (scope.isLoading) {
    return <LoadingState />;
  }

  if (scope.isError) {
    return (
      <EmptyState
        title="Unable to load your location"
        description="Your assigned location could not be loaded."
      />
    );
  }

  if (!locationId || !currentLocation) {
    return (
      <EmptyState
        title="No location available"
        description="You need an assigned location to manage staff access."
      />
    );
  }

  if (assignments.isLoading || users.isLoading || roles.isLoading) {
    return <LoadingState />;
  }

  if (assignments.isError || users.isError || roles.isError) {
    return (
      <EmptyState
        title="Unable to load staff assignments"
        description="Something went wrong while loading users, roles, or assignments."
        action={
          <Button variant="secondary" onClick={retryLoading}>
            Try again
          </Button>
        }
      />
    );
  }

  const isEditing = selected !== null;
  const isSaving = create.isPending || update.isPending;

  const statusVariant = (
    status?: string,
  ): "success" | "warning" | "danger" | "neutral" => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "success";
      case "LOCKED":
        return "danger";
      case "INACTIVE":
        return "warning";
      default:
        return "neutral";
    }
  };

  const availableUsers = (users.data?.content ?? []).filter(
    (user) => user.id !== me?.id,
  );

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6">
      <PageHeader
        icon={<Users size={19} />}
        title="Staff"
        description="Manage staff access and roles for your location."
        actions={
          <Button
            leftIcon={<Plus size={17} />}
            onClick={openCreate}
          >
            Assign role
          </Button>
        }
      />

      {/* Fixed location */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <MapPin size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Current location
          </p>
          <p className="mt-0.5 truncate text-sm font-semibold text-slate-900">
            {currentLocation.name}
          </p>
        </div>

        <Badge variant="info">Fixed location</Badge>
      </div>

      {/* Search and filtering */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_240px_auto] sm:items-end">
          <Input
            label="Search staff"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Name, username, or email..."
          />

          <Select
            label="Filter by role"
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
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
              className="sm:mb-0"
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Mutation feedback */}
      {remove.isError && (
        <p className="text-sm text-rose-600">
          Unable to remove the assignment. Please try again.
        </p>
      )}

      {/* Assignment table */}
      {visibleAssignments.length === 0 ? (
        <EmptyState
          icon={<Users size={28} />}
          title={
            locationAssignments.length === 0
              ? "No staff assignments yet"
              : "No matching assignments"
          }
          description={
            locationAssignments.length === 0
              ? `No staff have been assigned to ${currentLocation.name} yet.`
              : "Try changing your search or role filter."
          }
          action={
            locationAssignments.length === 0 ? (
              <Button
                leftIcon={<Plus size={16} />}
                onClick={openCreate}
              >
                Assign role
              </Button>
            ) : (
              <Button variant="secondary" onClick={clearFilters}>
                Clear filters
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-800">
              Staff assignments
            </h2>
            <span className="text-xs text-slate-500">
              {visibleAssignments.length}{" "}
              {visibleAssignments.length === 1 ? "assignment" : "assignments"}
            </span>
          </div>

          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Staff member</TableHeaderCell>
                <TableHeaderCell>Role</TableHeaderCell>
                <TableHeaderCell>Account status</TableHeaderCell>
                <TableHeaderCell className="text-right">
                  Actions
                </TableHeaderCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {visibleAssignments.map((assignment) => {
                const user = usersById.get(assignment.userId);
                const role = rolesById.get(assignment.roleId);

                const fullName = user
                  ? `${user.firstName} ${user.lastName}`.trim()
                  : `User #${assignment.userId}`;

                const initials = fullName
                  .split(/\s+/)
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part.charAt(0).toUpperCase())
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
                            {fullName}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-slate-500">
                            {user?.email || (user?.username ? `@${user.username}` : "—")}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          role?.isActive === false ? "warning" : "neutral"
                        }
                      >
                        {role?.name ?? `Role #${assignment.roleId}`}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge variant={statusVariant(user?.status)}>
                        {user?.status ?? "Unknown"}
                      </Badge>
                    </TableCell>

                    <TableCell align="right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Edit3 size={15} />}
                          onClick={() => openEdit(assignment)}
                        >
                          Edit
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Trash2 size={15} />}
                          onClick={() => setRemoveTarget(assignment)}
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
        open={open}
        onClose={closeForm}
        title={isEditing ? "Edit role assignment" : "Assign a role"}
        description={
          isEditing
            ? "Change the role assigned to this user at your location."
            : "Choose a user and the role they should have at your location."
        }
      >
        <form onSubmit={submit} className="space-y-5">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
            <p className="text-xs font-medium text-slate-500">Location</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {currentLocation.name}
            </p>
          </div>

          <Select
            label="User"
            value={formUserId}
            onChange={(event) => setFormUserId(event.target.value)}
            disabled={isEditing || isSaving}
            required
            options={[
              { label: "Select a user", value: "" },
              ...availableUsers.map((user) => ({
                label: `${user.firstName} ${user.lastName} · @${user.username}`,
                value: String(user.id),
              })),
            ]}
          />

          <Select
            label="Role"
            value={formRoleId}
            onChange={(event) => setFormRoleId(event.target.value)}
            disabled={isSaving}
            required
            options={[
              { label: "Select a role", value: "" },
              ...assignableRoles.map((role) => ({
                label: role.name,
                value: String(role.id),
              })),
            ]}
          />

          {mutationError && (
            <p role="alert" className="text-sm text-rose-600">
              {mutationError}
            </p>
          )}

          {create.isError && !mutationError && (
            <p className="text-sm text-rose-600">
              Unable to create this assignment.
            </p>
          )}

          {update.isError && !mutationError && (
            <p className="text-sm text-rose-600">
              Unable to update this assignment.
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
              {isEditing ? "Save changes" : "Create assignment"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm removal */}
      <Modal
        open={removeTarget !== null}
        onClose={() => {
          if (!remove.isPending) setRemoveTarget(null);
        }}
        title="Remove role assignment"
        description="This removes the user's role assignment at this location. It does not delete the user account."
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
                    {" "}from the{" "}
                    <strong>{role?.name ?? "assigned role"}</strong>
                    {" "}assignment at {currentLocation.name}?
                  </>
                );
              })()}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setRemoveTarget(null)}
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