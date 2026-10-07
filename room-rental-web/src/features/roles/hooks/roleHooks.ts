import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { roleApi } from "../api/roleApi";

import type {
  AssignPermissionsRequest,
  CreateRoleRequest,
  UpdateRoleRequest,
} from "../types/role";

export const roleKeys = {
  all: ["roles"] as const,

  detail: (id: number) =>
    [...roleKeys.all, id] as const,
};


// GET /roles
export function useRoles() {
  return useQuery({
    queryKey: roleKeys.all,

    queryFn: roleApi.getAll,

    staleTime: 5 * 60 * 1000,
  });
}


// GET /roles/{id}
export function useRole(id: number) {
  return useQuery({
    queryKey: roleKeys.detail(id),

    queryFn: () => roleApi.getById(id),

    enabled: !!id,

    staleTime: 5 * 60 * 1000,
  });
}


// POST /roles
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      request: CreateRoleRequest
    ) => roleApi.create(request),

    onSuccess: (role) => {
      queryClient.invalidateQueries({
        queryKey: roleKeys.all,
      });

      queryClient.setQueryData(
        roleKeys.detail(role.id),
        role
      );
    },
  });
}


// PUT /roles/{id}
export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: number;
      request: UpdateRoleRequest;
    }) =>
      roleApi.update(id, request),

    onSuccess: (role) => {
      queryClient.invalidateQueries({
        queryKey: roleKeys.all,
      });

      queryClient.setQueryData(
        roleKeys.detail(role.id),
        role
      );
    },
  });
}


// PUT /roles/{id}/permissions
export function useAssignPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: number;
      request: AssignPermissionsRequest;
    }) =>
      roleApi.assignPermissions(id, request),

    onSuccess: (role) => {
      queryClient.invalidateQueries({
        queryKey: roleKeys.all,
      });

      queryClient.setQueryData(
        roleKeys.detail(role.id),
        role
      );
    },
  });
}


// PATCH /roles/{id}/deactivate
export function useDeactivateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      roleApi.deactivate(id),

    onSuccess: (role) => {
      queryClient.invalidateQueries({
        queryKey: roleKeys.all,
      });

      queryClient.setQueryData(
        roleKeys.detail(role.id),
        role
      );
    },
  });
}


// PATCH /roles/{id}/activate
export function useActivateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      roleApi.activate(id),

    onSuccess: (role) => {
      queryClient.invalidateQueries({
        queryKey: roleKeys.all,
      });

      queryClient.setQueryData(
        roleKeys.detail(role.id),
        role
      );
    },
  });
}