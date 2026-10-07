import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { moduleApi } from "../api/moduleApi";

import type {
  CreateModuleRequest,
  UpdateModuleRequest,
} from "../types/module";

export const moduleKeys = {
  all: ["modules"] as const,

  detail: (id: number) =>
    [...moduleKeys.all, id] as const,
};


// GET /modules
export function useModules() {
  return useQuery({
    queryKey: moduleKeys.all,

    queryFn: moduleApi.getAll,

    staleTime: 5 * 60 * 1000,
  });
}


// GET /modules/{id}
export function useModule(id: number) {
  return useQuery({
    queryKey: moduleKeys.detail(id),

    queryFn: () => moduleApi.getById(id),

    enabled: !!id,

    staleTime: 5 * 60 * 1000,
  });
}


// POST /modules
export function useCreateModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      request: CreateModuleRequest
    ) => moduleApi.create(request),

    onSuccess: (module) => {
      queryClient.invalidateQueries({
        queryKey: moduleKeys.all,
      });

      queryClient.setQueryData(
        moduleKeys.detail(module.id),
        module
      );
    },
  });
}


// PUT /modules/{id}
export function useUpdateModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: number;
      request: UpdateModuleRequest;
    }) =>
      moduleApi.update(id, request),

    onSuccess: (module) => {
      queryClient.invalidateQueries({
        queryKey: moduleKeys.all,
      });

      queryClient.setQueryData(
        moduleKeys.detail(module.id),
        module
      );
    },
  });
}


// PATCH /modules/{id}/deactivate
export function useDeactivateModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      moduleApi.deactivate(id),

    onSuccess: (module) => {
      queryClient.invalidateQueries({
        queryKey: moduleKeys.all,
      });

      queryClient.setQueryData(
        moduleKeys.detail(module.id),
        module
      );
    },
  });
}


// PATCH /modules/{id}/activate
export function useActivateModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      moduleApi.activate(id),

    onSuccess: (module) => {
      queryClient.invalidateQueries({
        queryKey: moduleKeys.all,
      });

      queryClient.setQueryData(
        moduleKeys.detail(module.id),
        module
      );
    },
  });
}