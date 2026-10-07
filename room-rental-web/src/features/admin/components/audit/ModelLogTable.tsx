import { useState } from "react";
import {
  Button, Modal, Table, TableBody, TableCell, TableHead,
  TableHeaderCell, TableRow,
} from "../../../../components/ui/index.ts";
import type { ModelLogResponse } from "../../../audit/types/auditLog.ts";
import { ModelLogEventBadge } from "./ModelLogEventBadge.tsx";
import { ChangeDiffView } from "./ChangeDiffView.tsx";
import { JsonViewer } from "./JsonViewer.tsx";

interface Props {
  logs: ModelLogResponse[];
}

export function ModelLogTable({ logs }: Props) {
  const [selected, setSelected] = useState<ModelLogResponse | null>(null);

  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Date</TableHeaderCell>
            <TableHeaderCell>User</TableHeaderCell>
            <TableHeaderCell>Model</TableHeaderCell>
            <TableHeaderCell>Event</TableHeaderCell>
            <TableHeaderCell>Changed fields</TableHeaderCell>
            <TableHeaderCell className="text-right">Action</TableHeaderCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {logs.map((log) => {
            const fieldCount = log.changes?.changed_fields?.length ?? 0;
            return (
              <TableRow key={log.id}>
                <TableCell>
                  <span className="whitespace-nowrap text-xs text-slate-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </TableCell>
                <TableCell>{log.userName ?? `#${log.userId}`}</TableCell>
                <TableCell>
                  <span className="font-mono text-xs text-slate-600">
                    {log.modelType} <span className="text-slate-400">#{log.modelId}</span>
                  </span>
                </TableCell>
                <TableCell><ModelLogEventBadge event={log.event} /></TableCell>
                <TableCell>
                  <span className="text-xs text-slate-500">
                    {fieldCount > 0 ? `${fieldCount} field${fieldCount === 1 ? "" : "s"}` : "—"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => setSelected(log)}>
                    View diff
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title="Change details"
        description={
          selected
            ? `${selected.modelType} #${selected.modelId} — ${selected.event}`
            : undefined
        }
        size="lg"
      >
        {selected && (
          <div key={selected.id} className="space-y-4">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs md:grid-cols-4">
              <Meta label="User" value={selected.userName ?? `#${selected.userId}`} />
              <Meta label="Model" value={`${selected.modelType} #${selected.modelId}`} />
              <Meta label="Event" value={String(selected.event).toUpperCase()} />
              <Meta label="When" value={new Date(selected.createdAt).toLocaleString()} />
            </dl>

            <ChangeDiffView changes={selected.changes} />

            <details className="group rounded-xl border border-slate-200">
              <summary className="cursor-pointer select-none px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:bg-slate-50">
                Raw payload
              </summary>
              <div className="grid gap-3 p-3 md:grid-cols-2">
                <JsonViewer data={selected.changes?.old ?? {}} label="Before (raw)" />
                <JsonViewer data={selected.changes?.new ?? {}} label="After (raw)" />
              </div>
            </details>
          </div>
        )}
      </Modal>
    </>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-slate-400">{label}</dt>
      <dd className="font-medium text-slate-700">{value}</dd>
    </div>
  );
}