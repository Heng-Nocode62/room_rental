
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Button,
  Card,
  Input,
} from "../../../components/ui";

import type {
  PermissionResponse,
  RoleResponse,
} from "../types/role";

import {
  useAssignRolePermissions,
} from "../hooks/useAssignRolePermissions";


interface Props {
  role: RoleResponse;

  permissions:
    PermissionResponse[];
}


export function RolePermissionManager({
  role,
  permissions,
}: Props) {

  const [
    selectedIds,
    setSelectedIds,
  ] = useState<number[]>(
    role.permissions.map(
      (permission) =>
        permission.id
    )
  );


  const [
    search,
    setSearch,
  ] = useState("");


  const mutation =
    useAssignRolePermissions();


  useEffect(() => {

    setSelectedIds(
      role.permissions.map(
        (permission) =>
          permission.id
      )
    );

  }, [
    role.permissions,
  ]);


  const filteredPermissions =
    useMemo(
      () => {

        const keyword =
          search
            .trim()
            .toLowerCase();


        if (!keyword) {
          return permissions;
        }


        return permissions.filter(
          (permission) =>
            permission.code
              .toLowerCase()
              .includes(
                keyword
              ) ||
            permission.name
              .toLowerCase()
              .includes(
                keyword
              ) ||
            (
              permission.description ??
              ""
            )
              .toLowerCase()
              .includes(
                keyword
              )
            );

      },
      [
        permissions,
        search,
      ]
    );


  const togglePermission =
    (permissionId: number) => {

      setSelectedIds(
        (current) => {

          if (
            current.includes(
              permissionId
            )
          ) {

            return current.filter(
              (id) =>
                id !==
                permissionId
            );

          }


          return [
            ...current,
            permissionId,
          ];

        }
      );

    };


  const save =
    async () => {

      if (
        selectedIds.length ===
        0
      ) {
        return;
      }


      await mutation.mutateAsync({

        id:
          role.id,

        request: {
          permissionIds:
            selectedIds,
        },

      });

    };


  return (
    <Card>

      <div>

        <h2 className="text-base font-semibold text-slate-900">
          Permissions
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Choose what this role is allowed to do.
        </p>

      </div>


      <div className="mt-5">

        <Input
          placeholder="Search permissions..."
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
        />

      </div>


      <div className="mt-4 max-h-[420px] space-y-2 overflow-y-auto">

        {filteredPermissions.length ===
        0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            No permissions found.
          </p>
        ) : (
          filteredPermissions.map(
            (permission) => {

              const selected =
                selectedIds.includes(
                  permission.id
                );


              return (
                <label
                  key={
                    permission.id
                  }
                  className={[
                    "flex cursor-pointer gap-3 rounded-lg border p-3 transition",

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
                      togglePermission(
                        permission.id
                      )
                    }
                    className="mt-1 h-4 w-4 rounded border-slate-300"
                  />


                  <div className="min-w-0">

                    <p className="text-sm font-medium text-slate-900">
                      {permission.name}
                    </p>

                    <p className="text-xs font-mono text-slate-500">
                      {permission.code}
                    </p>

                    {permission.description && (
                      <p className="mt-1 text-xs text-slate-500">
                        {
                          permission.description
                        }
                      </p>
                    )}

                  </div>

                </label>
              );
            }
          )
        )}

      </div>


      <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4">

        <p className="text-xs text-slate-500">
          {selectedIds.length} selected
        </p>


        <Button
          onClick={
            save
          }
          loading={
            mutation.isPending
          }
          disabled={
            selectedIds.length ===
            0
          }
        >
          Save Permissions
        </Button>

      </div>


      {mutation.isError && (
        <p className="mt-4 text-sm text-red-600">
          Unable to update role permissions.
        </p>
      )}

    </Card>
  );
}