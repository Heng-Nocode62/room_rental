import type { ReactNode } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";

export interface QuickViewField {
  label: string;
  value: ReactNode;
  wide?: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  fields: QuickViewField[];
}

export function QuickViewDialog({
  open,
  onClose,
  title,
  eyebrow,
  fields,
}: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={eyebrow}
      size="lg"
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 to-white px-5 py-4">
          <div className="flex items-center gap-3">
           
            <div className="min-w-0">
              {eyebrow && (
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-500">
                  {eyebrow}
                </p>
              )}

              <h3 className="break-words text-base font-semibold text-slate-800">
                {title}
              </h3>
            </div>
          </div>
        </div>

        {/* Information Section */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Information
            </h4>

            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-500">
              {fields.length} {fields.length === 1 ? "field" : "fields"}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {fields.map((field, index) => (
              <div
                key={`${field.label}-${index}`}
                className={[
                  "group min-w-0 rounded-xl border border-slate-200/80",
                  "bg-white px-4 py-3.5 transition-colors",
                  "hover:border-indigo-200 hover:bg-indigo-50/20",
                  field.wide ? "sm:col-span-2" : "",
                ].join(" ")}
              >
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400 transition-colors group-hover:text-indigo-500">
                  {field.label}
                </p>

                <div className="min-w-0 break-words text-sm font-medium leading-6 text-slate-800 [&_*]:max-w-full">
                  {field.value !== null &&
                  field.value !== undefined &&
                  field.value !== "" ? (
                    field.value
                  ) : (
                    <span className="font-normal italic text-slate-400">
                      Not provided
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-slate-100 pt-4">
          {/* <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            Close
          </button> */}
          <Button
          variant="danger"
          onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
