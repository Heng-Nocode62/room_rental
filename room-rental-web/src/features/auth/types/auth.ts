
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RegisterResponse {
  message?: string;
}

export interface VerifyEmailRequest {
  email: string;
  otp: string;
}

export interface ResendOtpRequest {
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface UpdateMyProfileRequest {
  firstName: string;
  lastName: string;
  phone: string | null;
}

export interface ChangeMyPasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AuthUser {
  id: number;
  username?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  status: string;
  roles: Role[];
  navigation: NavigationItemResponse[];
}

export interface Role {
  id: number;
  code: string;
  name: string;
  permissions: Permission[];
}

export interface Permission {
  id: number;
  code: string;
  name: string;
  description?: string;
}

export type NavGroup = "application" | "setup" | "settings";

export interface NavigationItemResponse {
  key: string;
  path: string;
  icon: string;
  group: NavGroup;
  permission?: string | null;
  children?: NavigationItemResponse[] | null;
}
