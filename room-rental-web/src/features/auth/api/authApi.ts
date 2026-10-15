
import { api } from "../../../lib/axios";
import type {
  AuthUser,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ResendOtpRequest,
  VerifyEmailRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  UpdateMyProfileRequest,
  ChangeMyPasswordRequest,
} from "../types/auth";

export const authApi = {
  async login(request: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/auth/login", request);
    return response.data;
  },

  async register(request: RegisterRequest): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse>("/auth/register", request);
    return response.data;
  },

  async verifyEmail(request: VerifyEmailRequest): Promise<string> {
    const response = await api.post<string>("/auth/verify-email", request);
    return response.data;
  },

  async resendOtp(request: ResendOtpRequest): Promise<string> {
    const response = await api.post<string>("/auth/resend-otp", request);
    return response.data;
  },

  async refresh(): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/auth/refresh");
    return response.data;
  },

  async getMe(): Promise<AuthUser> {
    const response = await api.get<AuthUser>("/auth/me");
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout");
  },

  async loginWithGoogle(credential: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/auth/google", {
      credential,
    });
    return response.data;
  },

  async requestPasswordReset(
    request: ForgotPasswordRequest,
  ): Promise<void> {
    await api.post<void>("/auth/forgot-password", request);
  },

  async resetPassword(
    request: ResetPasswordRequest,
  ): Promise<void> {
    await api.post<void>("/auth/reset-password", request);
  },

  async updateMyProfile(
    request: UpdateMyProfileRequest,
  ): Promise<void> {
    await api.put<void>("/auth/me/profile", request);
  },

  async changeMyPassword(
    request: ChangeMyPasswordRequest,
  ): Promise<void> {
    await api.put<void>("/auth/change-password", request);
  },
};
