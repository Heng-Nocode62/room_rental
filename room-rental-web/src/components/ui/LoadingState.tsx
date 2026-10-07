import { Spinner } from "./Button";

interface LoadingStateProps {
  label?: string;
  className?: string;
}

export function LoadingState({ label = "Loading...", className }: LoadingStateProps) {
  return (
    <div className={["flex min-h-40 items-center justify-center gap-3 text-sm text-slate-500", className].filter(Boolean).join(" ")}>
      <Spinner size="md" />
      <span>{label}</span>
    </div>
  );
}
