import { useNavigate } from "react-router-dom";
import { Button, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "../../../components/ui";
import type { LanguageResponse } from "../types/language";
import { LanguageStatusBadge } from "./LanguageStatusBadge";

interface Props {
  languages: LanguageResponse[];
  onToggle: (language: LanguageResponse) => void;
  onDelete: (language: LanguageResponse) => void;
  togglingId?: number;
  deletingId?: number;
}

/** Flag is an image URL; fall back to a neutral placeholder when missing. */
function Flag({ src, title }: { src?: string | null; title: string }) {
  if (!src) {
    return (
      <span
        aria-hidden="true"
        className="flex h-8 w-12 items-center justify-center rounded-md bg-slate-100 text-xs text-slate-400 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700"
      >
        —
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={`${title} flag`}
      loading="lazy"
      className="h-8 w-12 rounded-md object-cover shadow-sm ring-1 ring-black/10 dark:ring-white/10"
    />
  );
}

export function LanguageTable({ languages, onToggle, onDelete, togglingId, deletingId }: Props) {
  const navigate = useNavigate();

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell className="w-20 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Flag
              </TableHeaderCell>
              <TableHeaderCell className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Language
              </TableHeaderCell>
              <TableHeaderCell className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Translations
              </TableHeaderCell>
              <TableHeaderCell className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </TableHeaderCell>
              <TableHeaderCell className="text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </TableHeaderCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {languages.map((language) => (
              <TableRow key={language.id}>
                <TableCell>
                  <Flag src={language.flag} title={language.title} />
                </TableCell>

                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {language.title}
                    </span>
                    <span className="w-fit rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      {language.code}
                    </span>
                  </div>
                </TableCell>

                <TableCell>
                  <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                    {language.translationCount}
                  </span>
                </TableCell>

                <TableCell>
                  <LanguageStatusBadge active={language.active} />
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/languages/${language.id}`)}
                    >
                      Manage
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      loading={togglingId === language.id}
                      onClick={() => onToggle(language)}
                    >
                      {language.active ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      loading={deletingId === language.id}
                      onClick={() => onDelete(language)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {languages.length === 0 && (
        <p className="border-t border-slate-200 py-12 text-center text-sm text-slate-500 dark:border-slate-800">
          No languages found.
        </p>
      )}
    </div>
  );
}