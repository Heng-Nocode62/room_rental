export interface UserLocationRoleRequest {
  userId: number;
  locationId: number;
  roleId: number;
}

export interface UserLocationRoleResponse {
  id: number;
  userId: number;
  locationId: number;
  roleId: number;
}
