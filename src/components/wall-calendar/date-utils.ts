import { HOLIDAYS, HOLIDAY_COLORS } from "./constants";
import { DayCell } from "./types";

/** Strip hours/minutes/seconds so date comparisons are safe */
export function stripTime(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Returns true when two nullable dates point to the same calendar day */
export function isSameDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate()
  );
}

/** Human-readable date label, e.g. "Monday, April 9, 2026" */
export function formatDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    year:    "numeric",
    month:   "long",
    day:     "numeric",
  });
}

/**
 * Returns { label, color } for a holiday on the given date, or null.
 * color is a resolved CSS hex/rgb string ready to use inline.
 */
export function getHolidayInfo(
  date: Date
): { label: string; color: string } | null {
  const h = HOLIDAYS.find(
    (h) => h.month === date.getMonth() && h.day === date.getDate()
  );
  if (!h) return null;
  return {
    label: h.label,
    color: h.color ? (HOLIDAY_COLORS[h.color] ?? "var(--accent)") : "var(--accent)",
  };
}

/**
 * Legacy helper — kept so any existing callers still compile.
 * Prefer getHolidayInfo() for new code.
 */
export function getHolidayLabel(date: Date): string | null {
  const info = getHolidayInfo(date);
  return info ? info.label : null;
}

/**
 * Builds a 6-row × 7-col matrix (42 cells) for the month that contains
 * `viewDate`. Weeks start on Monday (index 0 = MON).
 */
export function monthMatrix(viewDate: Date): DayCell[] {
  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);

  // How many days to back-fill from the previous month (Mon-based grid)
  // getDay() returns 0=Sun … 6=Sat; we want 0=Mon … 6=Sun
  const rawDow   = firstDay.getDay();          // 0 Sun … 6 Sat
  const startDow = rawDow === 0 ? 6 : rawDow - 1; // convert to Mon-based

  const cells: DayCell[] = [];

  // Previous month tail
  for (let i = startDow - 1; i >= 0; i--) {
    cells.push({
      date: new Date(year, month, -i),
      inCurrentMonth: false,
    });
  }

  // Current month
  for (let d = 1; d <= lastDay.getDate(); d++) {
    cells.push({
      date: new Date(year, month, d),
      inCurrentMonth: true,
    });
  }

  // Next month head — fill to complete 6 rows (42 cells)
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({
      date: new Date(year, month + 1, d),
      inCurrentMonth: false,
    });
  }

  return cells;
}