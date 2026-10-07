
import { useEffect, useMemo, useRef } from "react";

import { DateTime } from "luxon";

import { cn } from "./cn";

interface DateStripProps {
  value: string;

  onChange: (date: string) => void;

  timezone?: string;
  days?: number;

  minDate?: string;
  maxDate?: string;

  className?: string;
}

export function DateStrip({
  value,
  onChange,
  timezone = "local",
  days = 30,
  minDate,
  maxDate,
  className,
}: DateStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const today = DateTime.now().setZone(timezone);

  /*
   * -------------------------------------------------------
   * DATE WINDOW
   * -------------------------------------------------------
   *
   * Keep the window stable.
   *
   * We don't calculate dates around
   * the currently selected date.
   *
   * Otherwise clicking a date would
   * cause the whole strip to move.
   */

  const dates = useMemo(() => {
    const start = today.minus({
      days: 3,
    });

    return Array.from(
      {
        length: days,
      },
      (_, index) =>
        start.plus({
          days: index,
        }),
    );
  }, [days, timezone, today.toISODate()]);

  /*
   * -------------------------------------------------------
   * HELPERS
   * -------------------------------------------------------
   */

  const isDisabled = (date: DateTime) => {
    const iso = date.toISODate();

    if (!iso) {
      return true;
    }

    if (minDate && iso < minDate) {
      return true;
    }

    if (maxDate && iso > maxDate) {
      return true;
    }

    return false;
  };

  /*
   * -------------------------------------------------------
   * CENTER SELECTED DATE
   * -------------------------------------------------------
   *
   * When the page is opened or the date
   * changes programmatically, bring the
   * selected date into view.
   */

  useEffect(() => {
    const container = scrollRef.current;

    if (!container) {
      return;
    }

    const selected = container.querySelector("[data-date-selected='true']");

    if (selected instanceof HTMLElement) {
      selected.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [value]);

  /*
   * -------------------------------------------------------
   * SCROLL
   * -------------------------------------------------------
   */

  const scroll = (amount: number) => {
    scrollRef.current?.scrollBy({
      left: amount,
      behavior: "smooth",
    });
  };

  /*
   * -------------------------------------------------------
   * TODAY
   * -------------------------------------------------------
   */

  const todayIso = today.toISODate() ?? "";

  return (
    <div className={cn("flex items-center gap-2 font-sans rounded-md bg-white", className)}>
      {/* Previous */}

      <button
        type="button"
        aria-label="Scroll dates left"
        onClick={() => scroll(-420)}
        className="
          hidden
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-full
          text-lg
          text-[#5f6368]
          transition-colors
          hover:bg-[#f1f3f4]
          sm:flex
        "
      >
        ‹
      </button>

      {/* Date strip */}

      <div
        ref={scrollRef}
        className="
          flex
          min-w-0
          flex-1
          gap-1.5
          overflow-x-auto
          scroll-smooth
          py-1
          [-ms-overflow-style:none]
          scrollbar-none
          [&::-webkit-scrollbar]:hidden
        "
      >
        {dates.map((date) => {
          const iso = date.toISODate();

          if (!iso) {
            return null;
          }

          const selected = iso === value;

          const todaySelected = iso === todayIso;

          const disabled = isDisabled(date);

          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              data-date-selected={selected}
              onClick={() => onChange(iso)}
              className={cn(
                `
                flex
                w-16
                shrink-0
                flex-col
                items-center
                gap-1.5
                rounded-lg
                px-1
                py-2
                transition-colors
                `,

                !selected && "hover:bg-[#f1f3f4]",

                disabled &&
                  `
                  cursor-not-allowed
                  opacity-40
                  hover:bg-transparent
                  `,
              )}
            >
              {/* Day */}

              <p className="text-[11px] font-medium uppercase text-[#70757a]">
                {date.toFormat("ccc")}
              </p>

              {/* Number, circular like Google Calendar's mini picker */}

              <span
                className={cn(
                  `
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  text-base
                  `,

                  selected
                    ? "bg-[#1a73e8] font-medium text-white"
                    : todaySelected
                      ? "font-medium text-[#1a73e8] ring-1 ring-inset ring-[#1a73e8]"
                      : "text-[#3c4043]",
                )}
              >
                {date.toFormat("d")}
              </span>

              {/* Month */}

              <p className="text-[11px] text-[#70757a]">
                {date.toFormat("LLL")}
              </p>
            </button>
          );
        })}
      </div>

      {/* Next */}

      <button
        type="button"
        aria-label="Scroll dates right"
        onClick={() => scroll(420)}
        className="
          hidden
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-full
          text-lg
          text-[#5f6368]
          transition-colors
          hover:bg-[#f1f3f4]
          sm:flex
        "
      >
        ›
      </button>

      {/* Today */}

      <button
        type="button"
        onClick={() => onChange(todayIso)}
        disabled={value === todayIso}
        className="
          hidden
          h-9
          shrink-0
          rounded-full
          border
          border-[#dadce0]
          bg-white
          px-4
          text-sm
          font-medium
          text-[#3c4043]
          transition-colors
          hover:bg-[#f1f3f4]
          disabled:cursor-default
          disabled:border-transparent
          disabled:bg-[#f1f3f4]
          disabled:text-[#80868b]
          disabled:hover:bg-[#f1f3f4]
          md:block
        "
      >
        Today
      </button>
    </div>
  );
}
