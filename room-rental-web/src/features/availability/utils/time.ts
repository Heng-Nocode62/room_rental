
export function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);

  return hours * 60 + minutes;
}

export function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  const ampm = hours >= 12 ? "PM" : "AM";
  let hour12 = hours % 12;
  if (hour12 === 0) hour12 = 12; // 12 AM (midnight) or 12 PM (noon)

  return [
    String(hour12).padStart(2, "0"),
    String(remaining).padStart(2, "0"),
  ].join(":") + " " + ampm;
}

export function formatHour(hour: number): string {
  return String(hour).padStart(2, "0") + ":00";
}

export function formatTime(time: string){
  const hour = time.slice(0,2);
  const minute = time.slice(3,5);
  const ampm = Number(hour)<12 ? "AM":"PM";
  let hour12 = Number(hour)%12;
  if(hour12 === 0) hour12 = 12;
  return [
    String(hour12).padStart(2, "0"),
    String(minute).padStart(2, "0"),
  ].join(":") + " " + ampm;
}
