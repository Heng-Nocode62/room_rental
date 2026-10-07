export interface ModuleResponse {
  id: number;
  name: string;
  isActive: boolean;
}

export interface CreateModuleRequest {
  name: string;
}

export interface UpdateModuleRequest {
  name: string;
}