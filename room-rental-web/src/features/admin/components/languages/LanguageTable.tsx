import { Button, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "../../../../components/ui/index.ts";
import type { LanguageResponse } from "../../../languages/types/language.ts";
import { LanguageFlag } from "./LanguageFlag.tsx";
import { LanguageStatusBadge } from "./LanguageStatusBadge.tsx";

interface Props {
  languages: LanguageResponse[];
  onManage: (language: LanguageResponse) => void;
  onEdit: (language: LanguageResponse) => void;
  onToggle: (language: LanguageResponse) => void;
  onDelete: (language: LanguageResponse) => void;
  togglingId?: number;
  deletingId?: number;
}

const headClass = "text-xs font-semibold uppercase tracking-wide text-slate-500";

export function LanguageTable({ languages, onManage, onEdit, onToggle, onDelete, togglingId, deletingId }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell className={`w-20 ${headClass}`}>Flag</TableHeaderCell>
              <TableHeaderCell className={headClass}>Language</TableHeaderCell>
              <TableHeaderCell className={headClass}>Translations</TableHeaderCell>
              <TableHeaderCell className={headClass}>Status</TableHeaderCell>
              <TableHeaderCell className={`text-right ${headClass}`}>Actions</TableHeaderCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {languages.map((language) => (
              <TableRow key={language.id}>
                <TableCell>
                  <LanguageFlag flag={language.flag} title={language.title} />
                </TableCell>

                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-slate-900 dark:text-slate-100">{language.title}</span>
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
                    <Button variant="ghost" size="sm" onClick={() => onManage(language)}>Translations</Button>
                    <Button variant="ghost" size="sm" onClick={() => onEdit(language)}>Edit</Button>
                    <Button variant="secondary" size="sm" loading={togglingId === language.id} onClick={() => onToggle(language)}>
                      {language.active ? "Deactivate" : "Activate"}
                    </Button>
                    <Button variant="danger" size="sm" loading={deletingId === language.id} onClick={() => onDelete(language)}>
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}