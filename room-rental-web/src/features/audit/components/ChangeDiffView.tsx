import { useMemo } from "react";
import { cn } from "../../../components/ui";
import type { ModelLogChanges } from "../types/auditLog";

interface Props {
  changes?: ModelLogChanges | null;
}

function renderValue(v: unknown): string {
  if (v === undefined) return "—";
  if (v === null) return "null";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function isEqual(a: unknown, b: unknown) {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return a === b;
  }
}

export function ChangeDiffView({ changes }: Props) {
  const { keys, oldVals, newVals, changedSet } = useMemo(() => {
    const oldVals = changes?.old ?? {};
    const newVals = changes?.new ?? {};
    const changedSet = new Set(changes?.changed_fields ?? []);
    const keys = Array.from(
      new Set([...Object.keys(oldVals), ...Object.keys(newVals)]),
    ).sort();
    return { keys, oldVals, newVals, changedSet };
  }, [changes]);

  if (keys.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-400">
        No field changes were recorded for this event.
      </div>
    );
  }

  const changedCount = keys.filter(
    (k) => changedSet.has(k) || !isEqual(oldVals[k], newVals[k]),
  ).length;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-700 ring-1 ring-inset ring-amber-200">
          {changedCount} changed
        </span>
        <span>{keys.length} field{keys.length === 1 ? "" : "s"} total</span>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full table-fixed text-left text-xs">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
            <tr>
              <th className="w-40 px-3 py-2 font-semibold">Field</th>
              <th className="px-3 py-2 font-semibold">Before</th>
              <th className="px-3 py-2 font-semibold">After</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {keys.map((k) => {
              const changed = changedSet.has(k) || !isEqual(oldVals[k], newVals[k]);
              return (
                <tr key={k} className={cn(changed && "bg-amber-50/50")}>
                  <td className="px-3 py-2 align-top font-mono text-slate-700">
                    <span className="flex items-center gap-1.5">
                      {changed && (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                      )}
                      {k}
                    </span>
                  </td>
                  <td className="break-all px-3 py-2 align-top font-mono text-slate-500">
                    {renderValue(oldVals[k])}
                  </td>
                  <td className="break-all px-3 py-2 align-top font-mono text-slate-800">
                    {renderValue(newVals[k])}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}