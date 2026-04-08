"use client";

import { useMemo, useState } from "react";

type DayCell = {
  date: Date;
  inCurrentMonth: boolean;
};

const WEEK_DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const HOLIDAYS = [
  { month: 0, day: 1, label: "New Year" },
  { month: 11, day: 25, label: "Xmas" },
];

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function isSameDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function stripTime(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function monthMatrix(viewDate: Date): DayCell[] {
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

export default function Home() {
  const today = stripTime(new Date());
  const [viewDate, setViewDate] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState("");
  const [darkTheme, setDarkTheme] = useState(false);

  const days = useMemo(() => monthMatrix(viewDate), [viewDate]);
  const monthTitle = viewDate.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const tempEnd = startDate && !endDate ? hoveredDate : endDate;
  const rangeStart = startDate && tempEnd ? (startDate < tempEnd ? startDate : tempEnd) : null;
  const rangeEnd = startDate && tempEnd ? (startDate > tempEnd ? startDate : tempEnd) : null;

  function handleDayClick(day: Date) {
    const clean = stripTime(day);

    if (!startDate || (startDate && endDate)) {
      setStartDate(clean);
      setEndDate(null);
      return;
    }

    if (clean < startDate) {
      setEndDate(startDate);
      setStartDate(clean);
      return;
    }

    setEndDate(clean);
  }

  function isHoliday(date: Date): string | null {
    const hit = HOLIDAYS.find(
      (h) => h.month === date.getMonth() && h.day === date.getDate()
    );
    return hit ? hit.label : null;
  }

  return (
    <main className={`wall-root ${darkTheme ? "theme-dark" : "theme-light"}`}>
      <section className="wall-card">
        <header className="wall-hero">
          <div className="hero-overlay">
            <p className="hero-year">{viewDate.getFullYear()}</p>
            <h1>{monthTitle}</h1>
          </div>
        </header>

        <div className="wall-content">
          <section className="calendar-pane">
            <div className="calendar-toolbar">
              <button
                type="button"
                className="mini-btn"
                onClick={() =>
                  setViewDate(
                    new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1)
                  )
                }
              >
                ← Prev
              </button>
              <strong>{monthTitle}</strong>
              <button
                type="button"
                className="mini-btn"
                onClick={() =>
                  setViewDate(
                    new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1)
                  )
                }
              >
                Next →
              </button>
            </div>

            <div className="week-row">
              {WEEK_DAYS.map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>

            <div className="calendar-grid">
              {days.map(({ date, inCurrentMonth }) => {
                const holiday = isHoliday(date);
                const isStart = isSameDay(startDate, date);
                const isEnd = isSameDay(endDate, date);
                const isToday = isSameDay(today, date);
                const isInRange =
                  !!rangeStart &&
                  !!rangeEnd &&
                  stripTime(date) >= stripTime(rangeStart) &&
                  stripTime(date) <= stripTime(rangeEnd);

                return (
                  <button
                    key={date.toISOString()}
                    type="button"
                    onMouseEnter={() => setHoveredDate(stripTime(date))}
                    onMouseLeave={() => setHoveredDate(null)}
                    onClick={() => handleDayClick(date)}
                    className={[
                      "day-cell",
                      inCurrentMonth ? "current" : "faded",
                      isToday ? "today" : "",
                      isInRange ? "in-range" : "",
                      isStart ? "range-start" : "",
                      isEnd ? "range-end" : "",
                    ].join(" ")}
                    aria-label={formatDate(date)}
                  >
                    <span>{date.getDate()}</span>
                    {holiday && <small title={holiday}>●</small>}
                  </button>
                );
              })}
            </div>
          </section>

          <aside className="notes-pane">
            <div className="notes-top">
              <h2>Notes</h2>
              <button
                type="button"
                className="mini-btn"
                onClick={() => setDarkTheme((v) => !v)}
              >
                {darkTheme ? "Light theme" : "Dark theme"}
              </button>
            </div>

            <p className="selection-copy">
              {startDate && !endDate && `Start: ${formatDate(startDate)}`}
              {startDate &&
                endDate &&
                `Range: ${formatDate(startDate)} → ${formatDate(endDate)}`}
              {!startDate && "Pick a start and end day to create a focused plan."}
            </p>

            <textarea
              className="notes-input"
              placeholder="Write your memo, trip plan, or reminders..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <p className="notes-footer">{notes.length} characters</p>
          </aside>
        </div>
      </section>
    </main>
  );
}
