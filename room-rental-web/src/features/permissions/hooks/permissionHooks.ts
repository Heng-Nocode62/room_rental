import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { permissionApi } from "../api/permissionApi";

import type {
  CreatePermissionRequest,
  UpdatePermissionRequest,
} from "../types/permission";

export const permissionKeys = {
  all: ["permissions"] as const,

  detail: (id: number) =>
    [...permissionKeys.all, id] as const,

  byModule: (moduleId: number) =>
    [...permissionKeys.all, "module", moduleId] as const,

  byRole: (roleId: number) =>
    [...permissionKeys.all, "role", roleId] as const,
};

export function usePermissions() {
  return useQuery({
    queryKey: permissionKeys.all,
    queryFn: permissionApi.getAll,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePermission(id: number) {
  return useQuery({
    queryKey: permissionKeys.detail(id),
    queryFn: () => permissionApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePermissionsByModule(moduleId: number) {
  return useQuery({
    queryKey: permissionKeys.byModule(moduleId),
    queryFn: () => permissionApi.getByModuleId(moduleId),
    enabled: !!moduleId,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePermissionsByRole(roleId: number) {
  return useQuery({
    queryKey: permissionKeys.byRole(roleId),
    queryFn: () => permissionApi.getByRoleId(roleId),
    enabled: !!roleId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreatePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreatePermissionRequest) =>
      permissionApi.create(request),

    onSuccess: (permission) => {
      queryClient.invalidateQueries({
        queryKey: permissionKeys.all,
      });

      queryClient.setQueryData(
        permissionKeys.detail(permission.id),
        permission
      );
    },
  });
}

export function useUpdatePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: number;
      request: UpdatePermissionRequest;
    }) => permissionApi.update(id, request),

    onSuccess: (permission) => {
      queryClient.invalidateQueries({
        queryKey: permissionKeys.all,
      });

      queryClient.setQueryData(
        permissionKeys.detail(permission.id),
        permission
      );
    },
  });
}

export function useDeactivatePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      permissionApi.deactivate(id),

    onSuccess: (permission) => {
      queryClient.invalidateQueries({
        queryKey: permissionKeys.all,
      });

      queryClient.setQueryData(
        permissionKeys.detail(permission.id),
        permission
      );
    },
  });
}

export function useActivatePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      permissionApi.activate(id),

    onSuccess: (permission) => {
      queryClient.invalidateQueries({
        queryKey: permissionKeys.all,
      });

      queryClient.setQueryData(
        permissionKeys.detail(permission.id),
        permission
      );
    },
  });
}