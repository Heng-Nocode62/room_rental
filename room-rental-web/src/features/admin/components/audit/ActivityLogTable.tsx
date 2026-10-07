import { useState } from "react";
import {
  Button, Modal, Table, TableBody, TableCell, TableHead,
  TableHeaderCell, TableRow,
} from "../../../../components/ui/index.ts";
import type { ActivityLogResponse } from "../../../audit/types/activityLog.ts";
import { ActivityStatusBadge } from "./ActivityStatusBadge.tsx";
import { MethodBadge } from "./MethodBadge.tsx";
import { JsonViewer } from "./JsonViewer.tsx";

interface Props {
  logs: ActivityLogResponse[];
}

export function ActivityLogTable({ logs }: Props) {
  const [selected, setSelected] = useState<ActivityLogResponse | null>(null);

  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Date</TableHeaderCell>
            <TableHeaderCell>User</TableHeaderCell>
            <TableHeaderCell>Method</TableHeaderCell>
            <TableHeaderCell>URL</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>IP</TableHeaderCell>
            <TableHeaderCell className="text-right">Action</TableHeaderCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>
                <span className="whitespace-nowrap text-xs text-slate-500">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </TableCell>
              <TableCell>
                {log.userId != null ? `#${log.userId}` : <span className="text-slate-400">Anonymous</span>}
              </TableCell>
              <TableCell><MethodBadge method={log.method} /></TableCell>
              <TableCell>
                <span className="block max-w-xs truncate font-mono text-xs text-slate-600">
                  {log.url}
                </span>
              </TableCell>
              <TableCell><ActivityStatusBadge status={log.responseStatus} /></TableCell>
              <TableCell>
                <span className="font-mono text-xs text-slate-500">{log.ip ?? "—"}</span>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => setSelected(log)}>
                  Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title="Request details"
        description={
          selected ? `${selected.method} ${selected.url} — ${selected.responseStatus}` : undefined
        }
        size="lg"
      >
        {selected && (
          <div key={selected.id} className="space-y-4">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs md:grid-cols-4">
              <Meta label="User" value={selected.userId != null ? `#${selected.userId}` : "Anonymous"} />
              <Meta label="IP" value={selected.ip ?? "—"} />
              <Meta label="Status" value={String(selected.responseStatus)} />
              <Meta label="When" value={new Date(selected.createdAt).toLocaleString()} />
              <div className="col-span-2 md:col-span-4">
                <dt className="text-slate-400">User agent</dt>
                <dd className="break-all font-mono text-slate-600">{selected.userAgent ?? "—"}</dd>
              </div>
            </dl>

            <div className="grid gap-4 md:grid-cols-2">
              <JsonViewer data={selected.requestData} label="Request body" />
              <JsonViewer data={selected.responseData} label="Response body" />
            </div>
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