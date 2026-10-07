
export interface PermissionResponse {
  id: number;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface CreatePermissionRequest {
  code: string;
  name: string;
  description?: string;
  moduleId: number;
}

export interface UpdatePermissionRequest {
  code: string;
  name: string;
  description?: string;
  moduleId: number;
}

export interface PermissionResponse {
  id: number;
  code: string;
  name: string;
  description?: string;
  moduleId: number;
  isActive: boolean;
}