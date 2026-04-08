"use client";

import { useMemo, useState } from "react";
import CalendarGrid from "./CalendarGrid";
import { monthMatrix, stripTime } from "./date-utils";
import NotesPanel from "./NotesPanel";

export default function WallCalendar() {
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
          <CalendarGrid
            monthTitle={monthTitle}
            days={days}
            today={today}
            startDate={startDate}
            endDate={endDate}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            onPrevMonth={() =>
              setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
            }
            onNextMonth={() =>
              setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
            }
            onDayHover={setHoveredDate}
            onDayClick={handleDayClick}
          />

          <NotesPanel
            darkTheme={darkTheme}
            startDate={startDate}
            endDate={endDate}
            notes={notes}
            onToggleTheme={() => setDarkTheme((value) => !value)}
            onNotesChange={setNotes}
          />
        </div>
      </section>
    </main>
  );
}
