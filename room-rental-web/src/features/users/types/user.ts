export type UserStatus = "ACTIVE" | "INACTIVE" | "LOCKED" | string;

export interface PermissionResponse {
  isActive: any;
  id: number;
  code: string;
  name: string;
  description?: string;
}

export interface RoleResponse {
  id: number;
  code: string;
  name: string;
  description?: string;
  permissions: PermissionResponse[];
}

export interface UserResponse {
  id: number;

  username: string;

  firstName: string;
  lastName: string;

  email?: string;
  phone?: string;

  status: UserStatus;

  roles: RoleResponse[];
}

export interface CreateUserRequest {
  username: string;
  password: string;

  firstName: string;
  lastName: string;

  email?: string;
  phone?: string;
  roleId: number
}

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;

  email?: string;
  phone?: string;
}

export interface AssignRolesRequest {
  roleIds: number[];
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordRequest {
  newPassword: string;
}

export interface UserSearchParams {
  keyword?: string;

  status?: UserStatus;

  roleId?: number;

  page?: number;

  size?: number;

  sort?: string;
}
