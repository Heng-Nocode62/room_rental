export interface RootUserConfig {
  username: string;
}

export interface EditApprovedReportConfig {
  enabled: boolean;
  windowMinutes: number;
}

export interface CodeGenerateConfig {
  prefix: string;
  resetBy: string;
  sequenceLength: number;
}

export interface CmsConfig {
  baseUrl: string;
  clientKey: string;
  secretKey: string;
  token: string;
}

export interface AppFontOption {
  id: number;
  name: string;
}

export interface AppFontConfig {
  fonts?: AppFontOption[];
  active: number;
}

export interface AppDatetimeFormat {
  id: number;
  format: string;
}

export interface AppDatetimeConfig {
  formats?: AppDatetimeFormat[];
  active: number;
}

export interface AppConfig {
  appName: string;
  layout: string;
  skin: string;
}

export interface GlobalSetting {
  app: AppConfig;
  font: AppFontConfig;
  datetime: AppDatetimeConfig;
  editApprovedReport?: EditApprovedReportConfig;
  codeGenerate?: CodeGenerateConfig;
  cmsIntegration?: CmsConfig;
  rootUser?: RootUserConfig;
  [key: string]: unknown;
}

export interface GlobalSettingResponse {
  data?: Record<string, unknown>;
  app?: AppConfig;
  font?: AppFontConfig;
  datetime?: AppDatetimeConfig;
  editApprovedReport?: EditApprovedReportConfig;
  codeGenerate?: CodeGenerateConfig;
  [key: string]: unknown;
}

export interface UserConfigResponse {
  [key: string]: unknown;
}

export interface CardTextResponse {
  [key: string]: unknown;
}

function asRecord(value: unknown): Record<string, any> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, any>)
    : {};
}

function normalizeApp(value: unknown): AppConfig {
  const app = asRecord(value);
  return {
    appName: app.appName ?? app.app_name ?? "Room Rental",
    layout: app.layout ?? "vertical",
    skin: app.skin ?? "default",
  };
}

function normalizeFont(value: unknown): AppFontConfig {
  const font = asRecord(value);
  return {
    fonts: Array.isArray(font.fonts) ? font.fonts : undefined,
    active: Number(font.active ?? 1),
  };
}

function normalizeDatetime(value: unknown): AppDatetimeConfig {
  const datetime = asRecord(value);
  return {
    formats: Array.isArray(datetime.formats) ? datetime.formats : undefined,
    active: Number(datetime.active ?? 1),
  };
}

function normalizeEditApprovedReport(value: unknown): EditApprovedReportConfig | undefined {
  const config = asRecord(value);

  if (Object.keys(config).length === 0) {
    return undefined;
  }

  return {
    enabled: Boolean(config.enabled),
    windowMinutes: Number(config.windowMinutes ?? config.window_minutes ?? 0),
  };
}

function normalizeCodeGenerate(value: unknown): CodeGenerateConfig | undefined {
  const config = asRecord(value);

  if (Object.keys(config).length === 0) {
    return undefined;
  }

  return {
    prefix: String(config.prefix ?? ""),
    resetBy: String(config.resetBy ?? config.reset_by ?? "N"),
    sequenceLength: Number(config.sequenceLength ?? config.sequence_length ?? 1),
  };
}

export function normalizeGlobalSetting(response: GlobalSettingResponse): GlobalSetting {
  const root = asRecord(response?.data ?? response);

  return {
    ...root,
    app: normalizeApp(root.app ?? root.app_config),
    font: normalizeFont(root.font),
    datetime: normalizeDatetime(root.datetime ?? root.datetime_format),
    editApprovedReport: normalizeEditApprovedReport(
      root.editApprovedReport ?? root.allow_edit_approved_report,
    ),
    codeGenerate: normalizeCodeGenerate(
      root.codeGenerate ?? root.code_generate_request_test,
    ),
    cmsIntegration: root.cmsIntegration
      ? asRecord(root.cmsIntegration) as CmsConfig
      : root.cms_integration
        ? asRecord(root.cms_integration) as CmsConfig
        : undefined,
    rootUser: root.rootUser
      ? asRecord(root.rootUser) as RootUserConfig
      : root.root_user
        ? asRecord(root.root_user) as RootUserConfig
        : undefined,
  };
}
