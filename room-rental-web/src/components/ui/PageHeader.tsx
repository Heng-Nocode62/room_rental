import type { ReactNode } from "react";
import { cn } from "./cn";

interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  icon?: ReactNode;
}

export function PageHeader({ title, description, eyebrow, actions, icon }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-5 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">{eyebrow}</p>}
        <div className="flex items-center gap-3">
          {icon && <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">{icon}</div>}
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">{title}</h1>
        </div>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>}
      </div>
      {actions && <div className={cn("flex shrink-0 items-center gap-2")}>{actions}</div>}
    </div>
  );
}
