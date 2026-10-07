
export interface PermissionResponse {
  id: number;
  code: string;
  name: string;
  description?: string;
  moduleId: number;
  isActive: boolean;
}

export interface RoleResponse {
  id: number;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  permissions: PermissionResponse[];
}

export interface CreateRoleRequest {
  code: string;
  name: string;
  description?: string;
  permissionIds?: number[];
}

export interface UpdateRoleRequest {
  name: string;
  description?: string;
}

export interface AssignPermissionsRequest {
  permissionIds: number[];
}