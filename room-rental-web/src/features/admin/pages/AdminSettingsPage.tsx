import { useState } from "react";
import type { ComponentType } from "react";

import { Alert, Card, LoadingState, PageHeader } from "../../../components/ui/index.ts";

import { useGlobalConfig } from "../../settings/hooks/useGlobalConfig.ts";
import { useRootUserConfig } from "../../settings/hooks/useRootUserConfig.ts";
import { useCmsConfig } from "../../settings/hooks/useCmsConfig.ts";

import { useUpdateAppConfig } from "../../settings/hooks/useUpdateAppConfig.ts";
import { useUpdateRootUserConfig } from "../../settings/hooks/useUpdateRootUserConfig.ts";
import { useUpdateCmsConfig } from "../../settings/hooks/useUpdateCmsConfig.ts";
import { useUpdateEditApprovedReportConfig } from "../../settings/hooks/useUpdateEditApprovedReportConfig.ts";
import { useUpdateCodeGenerateConfig } from "../../settings/hooks/useUpdateCodeGenerateConfig.ts";
import { useUpdateFontConfig } from "../../settings/hooks/useUpdateFontConfig.ts";
import { useUpdateDatetimeConfig } from "../../settings/hooks/useUpdateDatetimeConfig.ts";

import { AppConfigForm } from "../components/settings/AppConfigForm.tsx";
import { RootUserConfigForm } from "../components/settings/RootUserConfigForm.tsx";
import { CmsConfigForm } from "../components/settings/CmsConfigForm.tsx";
import { ApprovalConfigForm } from "../components/settings/ApprovalConfigForm.tsx";
import { CodeGenerationConfigForm } from "../components/settings/CodeGenerationConfigForm.tsx";
import { FontConfigForm } from "../components/settings/FontConfigForm.tsx";
import { DatetimeConfigForm } from "../components/settings/DatetimeConfigForm.tsx";

import { createIcon } from "../../../components/ui/MaterialIcon.tsx"; // adjust path to wherever createIcon lives

// Create one icon component per section. If you already export these
// elsewhere (e.g. a shared icons.ts), import them instead of redeclaring here.
const TuneIcon = createIcon("tune");
const AdminPanelSettingsIcon = createIcon("admin_panel_settings");
const DnsIcon = createIcon("dns");
const FactCheckIcon = createIcon("fact_check");
const ScheduleIcon = createIcon("schedule");
const TextFieldsIcon = createIcon("text_fields");
const QrCodeIcon = createIcon("qr_code_2");

type SettingsSection = {
  key: string;
  label: string;
  Icon: ComponentType<{ size?: number | string; className?: string }>;
};

const SECTIONS: SettingsSection[] = [
  { key: "general", label: "General", Icon: TuneIcon },
  { key: "datetime", label: "Date & Time", Icon: ScheduleIcon },
  { key: "font", label: "Font", Icon: TextFieldsIcon },
  { key: "code-generation", label: "Code Generation", Icon: QrCodeIcon },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<string>("general");

  const { data: globalConfig, isLoading: isGlobalLoading } = useGlobalConfig();
  const { data: rootUserConfig, isLoading: isRootUserLoading } = useRootUserConfig();
  const { data: cmsConfig, isLoading: isCmsLoading } = useCmsConfig();

  const updateAppConfig = useUpdateAppConfig();
  const updateRootUserConfig = useUpdateRootUserConfig();
  const updateCmsConfig = useUpdateCmsConfig();
  const updateApprovalConfig = useUpdateEditApprovedReportConfig();
  const updateCodeGenerateConfig = useUpdateCodeGenerateConfig();
  const updateFontConfig = useUpdateFontConfig();
  const updateDatetimeConfig = useUpdateDatetimeConfig();

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6">
      <PageHeader
        title="Settings"
        description="Configure application-wide behavior, integrations and defaults."
      />

      <div className="flex gap-6">
        {/* Mini sidebar */}
        <nav className="w-48 shrink-0">
          <ul className="space-y-1">
            {SECTIONS.map((section) => {
              const isActive = activeSection === section.key;
              const Icon = section.Icon;
              return (
                <li key={section.key}>
                  <button
                    type="button"
                    onClick={() => setActiveSection(section.key)}
                    className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Icon size={18} />
                    <span>{section.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {activeSection === "general" && (
            <Card>
              <h2 className="mb-1 text-base font-semibold">Application</h2>
              <p className="mb-6 text-sm text-slate-500">
                Branding and layout used across the app.
              </p>

              {isGlobalLoading && <LoadingState />}

              {!isGlobalLoading && (
                <AppConfigForm
                  initialValues={globalConfig?.app}
                  loading={updateAppConfig.isPending}
                  onSubmit={(values) => updateAppConfig.mutateAsync(values).then(() => {})}
                />
              )}

              {updateAppConfig.isError && (
                <p className="mt-4 text-sm text-red-600">Unable to save application settings.</p>
              )}
            </Card>
          )}

          {activeSection === "root-user" && (
            <Card>
              <h2 className="mb-1 text-base font-semibold">Root User</h2>
              <p className="mb-6 text-sm text-slate-500">
                The built-in administrative account used for system operations.
              </p>

              {isRootUserLoading && <LoadingState />}

              {!isRootUserLoading && (
                <RootUserConfigForm
                  initialValues={rootUserConfig}
                  loading={updateRootUserConfig.isPending}
                  onSubmit={(values) => updateRootUserConfig.mutateAsync(values).then(() => {})}
                />
              )}

              {updateRootUserConfig.isError && (
                <p className="mt-4 text-sm text-red-600">Unable to save the root user settings.</p>
              )}
            </Card>
          )}

          {activeSection === "cms" && (
            <Card>
              <h2 className="mb-1 text-base font-semibold">CMS Integration</h2>
              <p className="mb-6 text-sm text-slate-500">
                Credentials used to connect to the content management system.
              </p>

              <Alert variant="warning" className="mb-6">
                Keys entered here are stored by the backend and only masked in this form.
              </Alert>

              {isCmsLoading && <LoadingState />}

              {!isCmsLoading && (
                <CmsConfigForm
                  initialValues={cmsConfig}
                  loading={updateCmsConfig.isPending}
                  onSubmit={(values) => updateCmsConfig.mutateAsync(values).then(() => {})}
                />
              )}

              {updateCmsConfig.isError && (
                <p className="mt-4 text-sm text-red-600">Unable to save the CMS settings.</p>
              )}
            </Card>
          )}

          {activeSection === "approvals" && (
            <Card>
              <h2 className="mb-1 text-base font-semibold">Report Approvals</h2>
              <p className="mb-6 text-sm text-slate-500">
                Control whether an approved report can still be edited, and for how long.
              </p>

              {isGlobalLoading && <LoadingState />}

              {!isGlobalLoading && (
                <ApprovalConfigForm
                  initialValues={globalConfig?.editApprovedReport}
                  loading={updateApprovalConfig.isPending}
                  onSubmit={(values) => updateApprovalConfig.mutateAsync(values).then(() => {})}
                />
              )}

              {updateApprovalConfig.isError && (
                <p className="mt-4 text-sm text-red-600">Unable to save the approval settings.</p>
              )}
            </Card>
          )}

          {activeSection === "datetime" && (
            <Card>
              <h2 className="mb-1 text-base font-semibold">Date & Time</h2>
              <p className="mb-6 text-sm text-slate-500">
                Select the global date and time format used across the application.
              </p>

              {isGlobalLoading && <LoadingState />}

              {!isGlobalLoading && (
                <DatetimeConfigForm
                  initialValues={globalConfig?.datetime}
                  loading={updateDatetimeConfig.isPending}
                  onSubmit={(values) => updateDatetimeConfig.mutateAsync(values).then(() => {})}
                />
              )}

              {updateDatetimeConfig.isError && (
                <p className="mt-4 text-sm text-red-600">Unable to save the date/time settings.</p>
              )}
            </Card>
          )}

          {activeSection === "font" && (
            <Card>
              <h2 className="mb-1 text-base font-semibold">Font</h2>
              <p className="mb-6 text-sm text-slate-500">
                Choose the global application font from the options configured by the backend.
              </p>

              {isGlobalLoading && <LoadingState />}

              {!isGlobalLoading && (
                <FontConfigForm
                  initialValues={globalConfig?.font}
                  loading={updateFontConfig.isPending}
                  onSubmit={(values) => updateFontConfig.mutateAsync(values).then(() => {})}
                />
              )}

              {updateFontConfig.isError && (
                <p className="mt-4 text-sm text-red-600">Unable to save the font settings.</p>
              )}
            </Card>
          )}

          {activeSection === "code-generation" && (
            <Card>
              <h2 className="mb-1 text-base font-semibold">Code Generation</h2>
              <p className="mb-6 text-sm text-slate-500">
                Format used when the system generates reference codes.
              </p>

              {isGlobalLoading && <LoadingState />}

              {!isGlobalLoading && (
                <CodeGenerationConfigForm
                  initialValues={globalConfig?.codeGenerate}
                  loading={updateCodeGenerateConfig.isPending}
                  onSubmit={(values) => updateCodeGenerateConfig.mutateAsync(values).then(() => {})}
                />
              )}

              {updateCodeGenerateConfig.isError && (
                <p className="mt-4 text-sm text-red-600">Unable to save the code generation settings.</p>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}