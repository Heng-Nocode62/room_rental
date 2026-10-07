interface Props {
  operatingStart: number;
  operatingEnd: number;
}

export function AvailabilityTimelineHeader({
  operatingStart,
  operatingEnd,
}: Props) {
  const firstHour = Math.floor(operatingStart / 60);

  const lastHour = Math.ceil(operatingEnd / 60);

  const hours = Array.from(
    {
      length: lastHour - firstHour,
    },
    (_, index) => firstHour + index,
  );

  return (
    <div className="grid grid-cols-[220px_minmax(700px,1fr)] border-b border-slate-200">
      <div className="border-r border-slate-200 bg-white px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Room
      </div>

      <div className="flex bg-slate-50">
        {hours.map((hour) => (
          <div
            key={hour}
            className="flex-1 border-r border-slate-200 px-2 py-3 text-center text-xs font-medium text-slate-500 last:border-r-0"
          >
            {String(hour).padStart(2, "0")}
            :00
          </div>
        ))}
      </div>
    </div>
  );
}
