import { useState } from "react";
import {
  Button,
  EmptyState,
  Input,
  LoadingState,
  Modal,
  PageHeader,
  Pagination,
} from "../../../components/ui";
import { Plus } from "../../../components/ui/MaterialIcon.tsx";
import { useLanguages } from "../../languages/hooks/useLanguages";
import { useCreateLanguage } from "../../languages/hooks/useCreateLanguage";
import { useUpdateLanguage } from "../../languages/hooks/useUpdateLanguage";
import { useDeleteLanguage } from "../../languages/hooks/useDeleteLanguage";
import { useToggleLanguage } from "../../languages/hooks/useToggleLanguage";
import { useTranslations } from "../../languages/hooks/useTranslations";
import { useUpsertTranslation } from "../../languages/hooks/useUpsertTranslation";
import { useDeleteTranslation } from "../../languages/hooks/useDeleteTranslation";
import { useToggleTranslation } from "../../languages/hooks/useToggleTranslation";
import { useExportTranslations } from "../../languages/hooks/useExportTranslations";
import { useImportTranslations } from "../../languages/hooks/useImportTranslations";
import type {
  JsonValue,
  TranslationResponse,
} from "../../languages/types/translation";
import type { LanguageResponse as Language } from "../../languages/types/language";
import {
  LanguageForm,
  type LanguageFormValues,
} from "../components/languages/LanguageForm";
import {
  TranslationForm,
  type TranslationFormValues,
} from "../components/languages/TranslationForm";
import { LanguageStatusBadge } from "../components/languages/LanguageStatusBadge";
import { TranslationTable } from "../components/languages/TranslationTable";
import { ImportTranslationsButton } from "../components/languages/ImportTranslationsButton";
import { LanguageTable } from "../components/languages/LanguageTable";
import { LanguageFlag } from "../components/languages/LanguageFlag.tsx";

function parseTranslationValue(value: string): JsonValue {
  const trimmed = value.trim();
  if (!trimmed) return "";
  try {
    return JSON.parse(trimmed) as JsonValue;
  } catch {
    return value;
  }
}

export default function AdminLanguagesPage() {
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Language | null>(null);
  const [dialog, setDialog] = useState<
    "create" | "edit" | "translations" | null
  >(null);
  const [translationPage, setTranslationPage] = useState(1);
  const [translationKeyword, setTranslationKeyword] = useState("");
  const [editingTranslation, setEditingTranslation] =
    useState<TranslationResponse | null>(null);
  const [showTranslationForm, setShowTranslationForm] = useState(false);

  const languages = useLanguages({
    keyword: keyword.trim() || undefined,
    page,
    perPage: 20,
  });
  const create = useCreateLanguage();
  const update = useUpdateLanguage();
  const remove = useDeleteLanguage();
  const toggle = useToggleLanguage();
  const importMutation = useImportTranslations();
  const exportMutation = useExportTranslations();
  const translations = useTranslations(selected?.id, {
    keyword: translationKeyword.trim() || undefined,
    page: translationPage,
    perPage: 50,
  });
  const upsert = useUpsertTranslation(selected?.id ?? 0);
  const deleteTranslation = useDeleteTranslation(selected?.id ?? 0);
  const toggleTranslation = useToggleTranslation(selected?.id ?? 0);

  const close = () => {
    setDialog(null);
    setSelected(null);
    setEditingTranslation(null);
    setShowTranslationForm(false);
    setTranslationKeyword("");
    setTranslationPage(1);
  };

  const submitLanguage = async (values: LanguageFormValues) => {
    if (dialog === "edit" && selected) {
      await update.mutateAsync({
        id: selected.id,
        request: {
          code: values.code.trim(),
          title: values.title.trim(),
          flag: values.flag.trim() || null,
          active: values.active,
        },
      });
    } else {
      await create.mutateAsync({
        code: values.code.trim(),
        title: values.title.trim(),
        flag: values.flag.trim() || undefined,
        active: values.active,
      });
    }
    close();
  };

  const submitTranslation = async (values: TranslationFormValues) => {
    if (!selected) return;
    await upsert.mutateAsync({
      key: values.key.trim(),
      value: parseTranslationValue(values.value),
      active: values.active,
    });
    setEditingTranslation(null);
    setShowTranslationForm(false);
  };

  const pageData = languages.data;
  const languageItems = pageData?.data ?? [];
  const meta = pageData?.meta;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <PageHeader
        icon={selected ? <LanguageFlag flag={selected?.flag} title={selected?.title} /> : ''}
        title="Languages"
        description="Manage languages and translations."
        actions={
          <div className="flex flex-wrap gap-2">
            <ImportTranslationsButton
              loading={importMutation.isPending}
              onImport={(file) => importMutation.mutate(file)}
            />
            <Button
              variant="secondary"
              loading={exportMutation.isPending}
              onClick={() =>
                exportMutation.mutate(languageItems.map((item) => item.id))
              }
            >
              Export XLSX
            </Button>
            <Button
              leftIcon={<Plus size={17} />}
              onClick={() => setDialog("create")}
            >
              Add language
            </Button>
          </div>
        }
      />

      <Input
        placeholder="Search languages by code or title..."
        value={keyword}
        onChange={(event) => {
          setKeyword(event.target.value);
          setPage(1);
        }}
      />

      {languages.isLoading && <LoadingState />}
      {languages.isError && (
        <EmptyState
          title="Unable to load languages"
          description="Something went wrong while loading languages."
          action={
            <Button
              variant="secondary"
              onClick={() => void languages.refetch()}
            >
              Try again
            </Button>
          }
        />
      )}

      {!languages.isLoading &&
        !languages.isError &&
        languageItems.length === 0 && (
          <EmptyState
            title="No languages"
            description="Add a language to start managing translations."
            action={
              <Button onClick={() => setDialog("create")}>Add language</Button>
            }
          />
        )}

      {!languages.isLoading &&
        !languages.isError &&
        languageItems.length > 0 && (
          <>
            <LanguageTable
              languages={languageItems}
              onManage={(language) => {
                setSelected(language);
                setDialog("translations");
              }}
              onEdit={(language) => {
                setSelected(language);
                setDialog("edit");
              }}
              onToggle={(language) => toggle.mutate(language.id)}
              onDelete={(language) => {
                if (window.confirm(`Delete the "${language.title}" language?`))
                  remove.mutate(language.id);
              }}
              togglingId={
                toggle.isPending ? Number(toggle.variables) : undefined
              }
              deletingId={
                remove.isPending ? Number(remove.variables) : undefined
              }
            />
            <Pagination
              pagination={{
                page: Math.max((meta?.currentPage ?? page) - 1, 0),
                size: meta?.perPage ?? 20,
                totalElements: meta?.total ?? 0,
                totalPages: meta?.lastPage ?? 1,
                first: (meta?.currentPage ?? page) <= 1,
                last: (meta?.currentPage ?? page) >= (meta?.lastPage ?? 1),
                empty: languageItems.length === 0,
              }}
              onPageChange={(nextPage) => setPage(nextPage + 1)}
            />
          </>
        )}

      <Modal
        open={dialog === "create" || dialog === "edit"}
        onClose={close}
        title={dialog === "edit" ? "Edit language" : "Create language"}
      >
        <LanguageForm
          mode={dialog === "edit" ? "edit" : "create"}
          initialValues={selected ?? undefined}
          onSubmit={submitLanguage}
          loading={create.isPending || update.isPending}
        />
      </Modal>

      <Modal
        open={dialog === "translations"}
        onClose={close}
        title={selected ? `Translations · ${selected.title}` : "Translations"}
        size="xl"
      >
        {selected && (
          <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                   <LanguageFlag flag={selected?.flag} title={selected?.title} />
                  <LanguageStatusBadge active={selected.active} />
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  Manage translation keys for {selected.code}.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Input
                  placeholder="Search keys..."
                  value={translationKeyword}
                  onChange={(event) => {
                    setTranslationKeyword(event.target.value);
                    setTranslationPage(1);
                  }}
                />
                <Button
                  leftIcon={<Plus size={15} />}
                  onClick={() => setShowTranslationForm(true)}
                >
                  Add translation
                </Button>
              </div>
            </div>
            {translations.isLoading && <LoadingState />}
            {translations.isError && (
              <EmptyState
                title="Unable to load translations"
                description="Something went wrong while loading translations."
                action={
                  <Button
                    variant="secondary"
                    onClick={() => void translations.refetch()}
                  >
                    Try again
                  </Button>
                }
              />
            )}
            {!translations.isLoading &&
              !translations.isError &&
              (translations.data?.data ?? []).length === 0 && (
                <EmptyState
                  title="No translations"
                  description="Add a translation key for this language."
                  action={
                    <Button onClick={() => setShowTranslationForm(true)}>
                      Add translation
                    </Button>
                  }
                />
              )}
            {!translations.isLoading &&
              !translations.isError &&
              (translations.data?.data ?? []).length > 0 && (
                <>
                  <TranslationTable
                    translations={translations.data?.data ?? []}
                    onEdit={(item) => setEditingTranslation(item)}
                    onDelete={(item) => {
                      if (
                        window.confirm(`Delete the "${item.key}" translation?`)
                      )
                        deleteTranslation.mutate(item.id);
                    }}
                    onToggle={(item) => toggleTranslation.mutate(item.id)}
                    deletingId={
                      deleteTranslation.isPending
                        ? Number(deleteTranslation.variables)
                        : undefined
                    }
                    togglingId={
                      toggleTranslation.isPending
                        ? Number(toggleTranslation.variables)
                        : undefined
                    }
                  />
                  <Pagination
                    pagination={{
                      page: Math.max(
                        (translations.data?.meta.currentPage ??
                          translationPage) - 1,
                        0,
                      ),
                      size: translations.data?.meta.perPage ?? 50,
                      totalElements: translations.data?.meta.total ?? 0,
                      totalPages: translations.data?.meta.lastPage ?? 1,
                      first:
                        (translations.data?.meta.currentPage ??
                          translationPage) <= 1,
                      last:
                        (translations.data?.meta.currentPage ??
                          translationPage) >=
                        (translations.data?.meta.lastPage ?? 1),
                      empty: (translations.data?.data ?? []).length === 0,
                    }}
                    onPageChange={(nextPage) =>
                      setTranslationPage(nextPage + 1)
                    }
                  />
                </>
              )}
            <div className="flex justify-end">
              <Button variant="secondary" onClick={close}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={showTranslationForm || Boolean(editingTranslation)}
        onClose={() => {
          setShowTranslationForm(false);
          setEditingTranslation(null);
        }}
        title={
          editingTranslation
            ? `Edit translation · ${editingTranslation.key}`
            : "Add translation"
        }
      >
        <TranslationForm
          initialValues={
            editingTranslation
              ? {
                  key: editingTranslation.key,
                  value:
                    editingTranslation.value as import("../../languages/types/translation").JsonValue,
                  active: editingTranslation.active,
                }
              : undefined
          }
          onSubmit={submitTranslation}
          onCancel={() => {
            setShowTranslationForm(false);
            setEditingTranslation(null);
          }}
          loading={upsert.isPending}
        />
      </Modal>
    </div>
  );
}
