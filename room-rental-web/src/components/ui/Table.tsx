import type {
  KeyboardEvent,
  ReactNode,
  TableHTMLAttributes,
  ThHTMLAttributes,
} from "react";
import { cn } from "./cn";

type Align = "left" | "center" | "right";

const alignClass: Record<Align, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  /** Alternate row shading for easier scanning on wide/dense tables. */
  zebra?: boolean;
  /** Keeps the header visible while the body scrolls. */
  stickyHeader?: boolean;
  /** Only used when stickyHeader is set. Defaults to 480px. */
  maxHeight?: number | string;
}

export function Table({
  className,
  zebra = false,
  stickyHeader = false,
  maxHeight = 480,
  ...props
}: TableProps) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-xl border border-slate-200 bg-white",
        stickyHeader && "overflow-y-auto scrollbar-custom",
      )}
      style={stickyHeader ? { maxHeight } : undefined}
    >
      <table
        className={cn(
          "w-full border-collapse text-sm",
          zebra && "[&_tbody_tr:nth-child(even)]:bg-slate-50/60",
          className,
        )}
        {...props}
      />
    </div>
  );
}

export function TableHead({
  children,
  sticky = false,
}: {
  children: ReactNode;
  sticky?: boolean;
}) {
  return (
    <thead
      className={cn(
        "bg-slate-50 text-left",
        sticky && "sticky top-0 z-10 shadow-[0_1px_0_0_theme(colors.slate.200)]",
      )}
    >
      {children}
    </thead>
  );
}

interface TableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function TableRow({ children, className, onClick, disabled }: TableRowProps) {
  const clickable = !!onClick && !disabled;

  const handleKeyDown = (event: KeyboardEvent<HTMLTableRowElement>) => {
    if (!clickable) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick?.();
    }
  };

  return (
    <tr
      onClick={clickable ? onClick : undefined}
      onKeyDown={clickable ? handleKeyDown : undefined}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      className={cn(
        "border-b border-slate-200 transition-colors last:border-b-0",
        clickable && "cursor-pointer hover:bg-slate-50 focus:outline-none focus:bg-slate-50",
        disabled && "opacity-50",
        className,
      )}
    >
      {children}
    </tr>
  );
}

interface TableHeaderCellProps extends ThHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
  className?: string;
  align?: Align;
  /** Pass to make the header interactive; null means "not currently sorted". */
  sortDirection?: "asc" | "desc" | null;
  onSort?: () => void;
}

export function TableHeaderCell({
  children,
  className,
  align = "left",
  sortDirection,
  onSort,
  ...props
}: TableHeaderCellProps) {
  const sortable = !!onSort;

  return (
    <th
      className={cn(
        "whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500",
        alignClass[align],
        className,
      )}
      aria-sort={
        sortDirection === "asc"
          ? "ascending"
          : sortDirection === "desc"
            ? "descending"
            : sortable
              ? "none"
              : undefined
      }
      {...props}
    >
      {sortable ? (
        <button
          type="button"
          onClick={onSort}
          className={cn(
            "inline-flex items-center gap-1 normal-case tracking-normal text-xs font-semibold text-slate-500 hover:text-slate-800",
            align === "right" && "flex-row-reverse",
          )}
        >
          {children}

          <svg
            viewBox="0 0 12 12"
            className={cn(
              "h-3 w-3 shrink-0 transition",
              sortDirection ? "text-slate-700" : "text-slate-300",
            )}
            fill="none"
          >
            <path
              d="M6 2.5 3 6h6L6 2.5Z"
              fill="currentColor"
              opacity={sortDirection === "asc" ? 1 : 0.35}
            />
            <path
              d="M6 9.5 3 6h6L6 9.5Z"
              fill="currentColor"
              opacity={sortDirection === "desc" ? 1 : 0.35}
            />
          </svg>
        </button>
      ) : (
        children
      )}
    </th>
  );
}

export function TableCell({
  children,
  className,
  align = "left",
}: {
  children: ReactNode;
  className?: string;
  align?: Align;
}) {
  return (
    <td
      className={cn(
        "px-4 py-3 align-middle text-slate-700",
        alignClass[align],
        className,
      )}
    >
      {children}
    </td>
  );
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>;
}

/** Single centered row for "no results" states — pass the visible column count. */
export function TableEmptyState({
  colSpan,
  children,
}: {
  colSpan: number;
  children: ReactNode;
}) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-4 py-10 text-center text-sm text-slate-500"
      >
        {children}
      </td>
    </tr>
  );
}

/** Skeleton rows to render while data is loading, matching the real row height. */
export function TableSkeletonRows({
  rows = 5,
  columns,
}: {
  rows?: number;
  columns: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-slate-200 last:border-b-0">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex} className="px-4 py-3">
              <div className="h-3.5 w-full max-w-[8rem] animate-pulse rounded bg-slate-100" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}