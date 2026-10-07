import { Badge, Button, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "../../../../components/ui/index.ts";
import type { TranslationResponse } from "../../../languages/types/translation.ts";

interface Props {
  translations: TranslationResponse[];
  onEdit: (translation: TranslationResponse) => void;
  onDelete: (translation: TranslationResponse) => void;
  onToggle: (translation: TranslationResponse) => void;
  deletingId?: number;
  togglingId?: number;
}

function displayValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (value == null) return "";
  try { return JSON.stringify(value); } catch { return String(value); }
}

export function TranslationTable({ translations, onEdit, onDelete, onToggle, deletingId, togglingId }: Props) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Key</TableHeaderCell>
          <TableHeaderCell>Value</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell className="text-right">Action</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {translations.map((translation) => (
          <TableRow key={translation.id}>
            <TableCell><span className="font-mono text-xs text-slate-600">{translation.key}</span></TableCell>
            <TableCell><span className="block max-w-md truncate">{displayValue(translation.value)}</span></TableCell>
            <TableCell><Badge variant={translation.active ? "success" : "neutral"}>{translation.active ? "Active" : "Inactive"}</Badge></TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => onEdit(translation)}>Edit</Button>
                <Button variant="secondary" size="sm" loading={togglingId === translation.id} onClick={() => onToggle(translation)}>
                  {translation.active ? "Deactivate" : "Activate"}
                </Button>
                <Button variant="danger" size="sm" loading={deletingId === translation.id} onClick={() => onDelete(translation)}>Delete</Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
