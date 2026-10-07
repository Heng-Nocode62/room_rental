import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "./MaterialIcon.tsx";
import { cn } from "./cn";

export interface ActionMenuItem {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  tone?: "default" | "danger" | "success";
  disabled?: boolean;
  dividerBefore?: boolean;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  label?: string;
  align?: "left" | "right";
}

export function ActionMenu({
  items,
  label = "Actions",
  align = "right",
}: ActionMenuProps) {
  const [open, setOpen] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState({
    top: 0,
    left: 0,
  });

  const updatePosition = () => {
    const button = buttonRef.current;

    if (!button) return;

    const rect = button.getBoundingClientRect();

    const menuHeight = Math.min(items.length * 40 + 20, 300);

    const spaceBelow = window.innerHeight - rect.bottom;
    const shouldOpenUp = spaceBelow < menuHeight + 8;

    const top = shouldOpenUp
      ? Math.max(8, rect.top - menuHeight - 8)
      : rect.bottom + 8;

    const left =
      align === "right"
        ? Math.max(8, rect.right - 192)
        : Math.min(rect.left, window.innerWidth - 200);

    setPosition({ top, left });
  };

  useEffect(() => {
    if (!open) return;

    updatePosition();

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        !buttonRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    const onScroll = () => {
      updatePosition();
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, align, items.length]);

  return (
    <div className="inline-flex">
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        title={label}
        aria-expanded={open}
        onClick={() => {
          if (!open) {
            updatePosition();
          }

          setOpen((value) => !value);
        }}
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500",
          "shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800",
          "focus:outline-none focus:ring-2 focus:ring-indigo-500/20",
          open && "border-indigo-200 bg-indigo-50 text-indigo-700",
        )}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: position.top,
              left: position.left,
              zIndex: 9999,
            }}
            className="min-w-48 max-h-[calc(100vh-16px)] overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10"
          >
            {items.map((item, index) => (
              <div key={`${item.label}-${index}`}>
                {item.dividerBefore && (
                  <div className="my-1 border-t border-slate-100" />
                )}

                <button
                  type="button"
                  disabled={item.disabled}
                  onClick={() => {
                    if (item.disabled) return;

                    setOpen(false);
                    item.onClick();
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition",
                    item.tone === "danger"
                      ? "text-rose-600 hover:bg-rose-50"
                      : item.tone === "success"
                        ? "text-emerald-700 hover:bg-emerald-50"
                        : "text-slate-700 hover:bg-slate-50",
                    item.disabled && "cursor-not-allowed opacity-40",
                  )}
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                    {item.icon}
                  </span>

                  <span>{item.label}</span>
                </button>
              </div>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
