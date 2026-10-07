import { coreApi } from "../../../lib/axios";

import type {
  AppConfig,
  AppDatetimeConfig,
  AppFontConfig,
  CardTextResponse,
  CmsConfig,
  CodeGenerateConfig,
  EditApprovedReportConfig,
  GlobalSettingResponse,
  RootUserConfig,
  UserConfigResponse,
} from "../types/config";

export const configApi = {
  async getGlobalSetting(): Promise<GlobalSettingResponse> {
    const response = await coreApi.get<GlobalSettingResponse>("/config");

    return response.data;
  },

  async getUserConfig(): Promise<UserConfigResponse> {
    const response = await coreApi.get<UserConfigResponse>("/config/user");

    return response.data;
  },

  async getCardText(): Promise<CardTextResponse> {
    const response = await coreApi.get<CardTextResponse>("/config/card-text");

    return response.data;
  },

  async getRootUserConfig(): Promise<RootUserConfig> {
    const response = await coreApi.get<RootUserConfig>("/config/root-user");

    return response.data;
  },

  async updateRootUserConfig(
    request: RootUserConfig,
  ): Promise<RootUserConfig> {
    const response = await coreApi.put<RootUserConfig>(
      "/config/root-user",
      request,
    );

    return response.data;
  },

  async getCmsConfig(): Promise<CmsConfig> {
    const response = await coreApi.get<CmsConfig>("/config/cms");

    return response.data;
  },

  async updateCmsConfig(request: CmsConfig): Promise<CmsConfig> {
    const response = await coreApi.put<CmsConfig>("/config/cms", request);

    return response.data;
  },

  async updateAppConfig(request: AppConfig): Promise<AppConfig> {
    const response = await coreApi.put<AppConfig>(
      "/config/app-config",
      request,
    );

    return response.data;
  },

  async updateFont(request: AppFontConfig): Promise<AppFontConfig> {
    const response = await coreApi.put<AppFontConfig>(
      "/config/app-font",
      request,
    );

    return response.data;
  },

  async updateDatetimeFormat(
    request: AppDatetimeConfig,
  ): Promise<AppDatetimeConfig> {
    const response = await coreApi.put<AppDatetimeConfig>(
      "/config/app-datetime",
      request,
    );

    return response.data;
  },

  async updateEditApprovedReport(
    request: EditApprovedReportConfig,
  ): Promise<EditApprovedReportConfig> {
    const response = await coreApi.put<EditApprovedReportConfig>(
      "/config/edit-approved-report",
      request,
    );

    return response.data;
  },

  async updateCodeGenerateRequestTest(
    request: CodeGenerateConfig,
  ): Promise<CodeGenerateConfig> {
    const response = await coreApi.put<CodeGenerateConfig>(
      "/config/code-generate-request-test",
      request,
    );

    return response.data;
  },
};
