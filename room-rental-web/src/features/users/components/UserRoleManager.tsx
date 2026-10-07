
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Button,
  Card,
  Select,
} from "../../../components/ui";

import type {
  RoleResponse,
  UserResponse,
} from "../types/user";

import {
  useAssignUserRoles,
} from "../hooks/useAssignUserRoles";


interface Props {
  user: UserResponse;

  roles: RoleResponse[];
}


export function UserRoleManager({
  user,
  roles,
}: Props) {

  const [
    selectedRoleIds,
    setSelectedRoleIds,
  ] = useState<number[]>(
    user.roles.map(
      (role) =>
        role.id
    )
  );


  useEffect(() => {

    setSelectedRoleIds(
      user.roles.map(
        (role) =>
          role.id
      )
    );

  }, [user.roles]);


  const mutation =
    useAssignUserRoles();


  const selectedRoles =
    useMemo(
      () =>
        roles.filter(
          (role) =>
            selectedRoleIds.includes(
              role.id
            )
        ),
      [
        roles,
        selectedRoleIds,
      ]
    );


  const toggleRole = (
    roleId: number
  ) => {

    setSelectedRoleIds(
      (current) => {

        if (
          current.includes(
            roleId
          )
        ) {

          return current.filter(
            (id) =>
              id !== roleId
          );
        }

        return [
          ...current,
          roleId,
        ];
      }
    );
  };


  const saveRoles =
    async () => {

      /*
       * Backend requires at least
       * one role.
       */
      if (
        selectedRoleIds.length ===
        0
      ) {
        return;
      }


      await mutation.mutateAsync({

        id:
          user.id,

        request: {
          roleIds:
            selectedRoleIds,
        },

      });

    };


  return (
    <Card>

      <div>

        <h2 className="text-base font-semibold text-slate-900">
          Roles
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Control which areas this staff member can access.
        </p>

      </div>


      <div className="mt-5 space-y-2">

        {roles.map(
          (role) => {

            const selected =
              selectedRoleIds.includes(
                role.id
              );


            return (
              <label
                key={
                  role.id
                }
                className={[
                  "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition",

                  selected
                    ? "border-slate-400 bg-slate-50"
                    : "border-slate-200 hover:bg-slate-50",
                ].join(" ")}
              >

                <input
                  type="checkbox"
                  checked={
                    selected
                  }
                  onChange={() =>
                    toggleRole(
                      role.id
                    )
                  }
                  className="mt-1 h-4 w-4 rounded border-slate-300"
                />


                <div>

                  <p className="text-sm font-medium text-slate-900">
                    {role.name}
                  </p>

                  <p className="text-xs text-slate-500">
                    {role.code}
                  </p>

                  {role.description && (
                    <p className="mt-1 text-xs text-slate-500">
                      {role.description}
                    </p>
                  )}

                </div>

              </label>
            );
          }
        )}

      </div>


      <div className="mt-5 flex items-center justify-between">

        <p className="text-xs text-slate-500">
          {selectedRoles.length}{" "}
          {selectedRoles.length ===
          1
            ? "role"
            : "roles"}{" "}
          selected
        </p>


        <Button
          onClick={
            saveRoles
          }
          loading={
            mutation.isPending
          }
          disabled={
            selectedRoleIds.length ===
            0
          }
        >
          Save Roles
        </Button>

      </div>


      {mutation.isError && (
        <p className="mt-4 text-sm text-red-600">
          Unable to update user roles.
        </p>
      )}

    </Card>
  );
}