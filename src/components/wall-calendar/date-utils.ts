import { HOLIDAYS } from "./constants";
import { DayCell } from "./types";

export function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function isSameDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function stripTime(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function monthMatrix(viewDate: Date): DayCell[] {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const first = new Date(year, month, 1);
  const firstDayIndex = (first.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - firstDayIndex);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return { date, inCurrentMonth: date.getMonth() === month };
  });
}

export function getHolidayLabel(date: Date): string | null {
  const hit = HOLIDAYS.find(
    (h) => h.month === date.getMonth() && h.day === date.getDate()
  );
  return hit ? hit.label : null;
}
