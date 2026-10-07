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

export function LanguageTable({ languages, onToggle, onDelete, togglingId, deletingId }: Props) {
  const navigate = useNavigate();

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Flag</TableHeaderCell>
          <TableHeaderCell>Title</TableHeaderCell>
          <TableHeaderCell>Code</TableHeaderCell>
          <TableHeaderCell>Translations</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell className="text-right">Action</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {languages.map((language) => (
          <TableRow key={language.id}>
            <TableCell className="text-lg">{language.flag || "—"}</TableCell>
            <TableCell><p className="font-medium text-slate-900">{language.title}</p></TableCell>
            <TableCell><span className="font-mono text-xs uppercase text-slate-500">{language.code}</span></TableCell>
            <TableCell>{language.translationCount}</TableCell>
            <TableCell><LanguageStatusBadge active={language.active} /></TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate(`/languages/${language.id}`)}>Manage</Button>
                <Button variant="secondary" size="sm" loading={togglingId === language.id} onClick={() => onToggle(language)}>
                  {language.active ? "Deactivate" : "Activate"}
                </Button>
                <Button variant="danger" size="sm" loading={deletingId === language.id} onClick={() => onDelete(language)}>Delete</Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
