import { useMemo, useState } from "react";
import { cn } from "../../../components/ui";

const SENSITIVE_KEY = /(token|password|secret|authorization|api[_-]?key)/i;

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function containsSensitive(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(containsSensitive);
  if (isPlainObject(value)) {
    return Object.entries(value).some(
      ([k, v]) => SENSITIVE_KEY.test(k) || containsSensitive(v),
    );
  }
  return false;
}

function primitiveClass(v: unknown) {
  if (v === null) return "text-slate-400";
  switch (typeof v) {
    case "string": return "text-emerald-600";
    case "number": return "text-amber-600";
    case "boolean": return "text-purple-600";
    default: return "text-slate-500";
  }
}

function primitiveText(v: unknown) {
  if (v === null) return "null";
  if (typeof v === "string") return `"${v}"`;
  if (typeof v === "undefined") return "undefined";
  return String(v);
}

interface NodeProps {
  name?: string;
  isIndex?: boolean;
  value: unknown;
  depth: number;
  revealed: boolean;
}

function JsonNode({ name, isIndex, value, depth, revealed }: NodeProps) {
  const [open, setOpen] = useState(depth < 2);
  const masked =
    name !== undefined &&
    !revealed &&
    SENSITIVE_KEY.test(name) &&
    typeof value === "string";

  const keyEl =
    name !== undefined ? (
      <>
        <span className={cn("shrink-0", isIndex ? "text-slate-400" : "text-sky-700")}>
          {isIndex ? name : `"${name}"`}
        </span>
        <span className="text-slate-400">:&nbsp;</span>
      </>
    ) : null;

  if (masked) {
    return (
      <div className="flex">
        {keyEl}
        <span className="text-slate-400">"••••••••"</span>
      </div>
    );
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <div className="flex">{keyEl}<span className="text-slate-400">[]</span></div>;
    }
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center gap-1 text-left hover:bg-slate-100/60"
        >
          <span className="w-3 shrink-0 text-slate-400">{open ? "▾" : "▸"}</span>
          {keyEl}
          <span className="text-slate-400">
            {open ? "[" : `[ … ${value.length} items ]`}
          </span>
        </button>
        {open && (
          <div className="ml-1.5 border-l border-slate-200 pl-3">
            {value.map((v, i) => (
              <JsonNode key={i} name={String(i)} isIndex value={v} depth={depth + 1} revealed={revealed} />
            ))}
            <div className="text-slate-400">]</div>
          </div>
        )}
      </div>
    );
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value);
    if (entries.length === 0) {
      return <div className="flex">{keyEl}<span className="text-slate-400">{"{}"}</span></div>;
    }
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center gap-1 text-left hover:bg-slate-100/60"
        >
          <span className="w-3 shrink-0 text-slate-400">{open ? "▾" : "▸"}</span>
          {keyEl}
          <span className="text-slate-400">
            {open ? "{" : `{ … ${entries.length} keys }`}
          </span>
        </button>
        {open && (
          <div className="ml-1.5 border-l border-slate-200 pl-3">
            {entries.map(([k, v]) => (
              <JsonNode key={k} name={k} value={v} depth={depth + 1} revealed={revealed} />
            ))}
            <div className="text-slate-400">{"}"}</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex">
      {keyEl}
      <span className={cn("break-all", primitiveClass(value))}>{primitiveText(value)}</span>
    </div>
  );
}

interface Props {
  data: unknown;
  className?: string;
  label?: string;
}

export function JsonViewer({ data, className, label = "JSON" }: Props) {
  const [revealed, setRevealed] = useState(false);
  const hasSensitive = useMemo(() => containsSensitive(data), [data]);
  const isEmpty = data === null || data === undefined;

  return (
    <div className={cn("overflow-hidden rounded-xl border border-slate-200 bg-white", className)}>
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-3 py-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </span>
        {hasSensitive && !isEmpty && (
          <button
            type="button"
            onClick={() => setRevealed((r) => !r)}
            className="text-[11px] font-medium text-slate-500 transition-colors hover:text-slate-800"
          >
            {revealed ? "Hide sensitive" : "Reveal sensitive"}
          </button>
        )}
      </div>

      {isEmpty ? (
        <div className="px-3 py-6 text-center text-xs italic text-slate-400">
          No data captured
        </div>
      ) : (
        <div className="max-h-80 overflow-auto p-3 font-mono text-[12px] leading-relaxed">
          <JsonNode value={data} depth={0} revealed={revealed} />
        </div>
      )}
    </div>
  );
}