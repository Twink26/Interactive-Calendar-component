"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import CalendarGrid from "./CalendarGrid";
import { monthMatrix, stripTime } from "./date-utils";
import NotesPanel from "./NotesPanel";

// Unsplash images per month (landscape, high quality)
const MONTH_IMAGES: Record<number, string> = {
  0:  "https://images.unsplash.com/photo-1483664852095-d6cc6870702d?w=1200&q=80", // Jan – snowy forest
  1:  "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80", // Feb – mountain stars
  2:  "https://images.unsplash.com/photo-1490750967868-88df5691cc43?w=1200&q=80", // Mar – cherry blossoms
  3:  "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=1200&q=80", // Apr – green meadow
  4:  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80", // May – coastal cliffs
  5:  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80", // Jun – mountain climber
  6:  "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=1200&q=80", // Jul – tropical beach
  7:  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200&q=80", // Aug – sunflower field
  8:  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80", // Sep – autumn lake
  9:  "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&q=80", // Oct – fall forest
  10: "https://images.unsplash.com/photo-1477601263568-180e2c6d046e?w=1200&q=80", // Nov – misty hills
  11: "https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=1200&q=80", // Dec – winter cabin
};

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
  const monthName = viewDate.toLocaleDateString(undefined, { month: "long" });

  const tempEnd = startDate && !endDate ? hoveredDate : endDate;
  const rangeStart =
    startDate && tempEnd
      ? startDate < tempEnd
        ? startDate
        : tempEnd
      : null;
  const rangeEnd =
    startDate && tempEnd
      ? startDate > tempEnd
        ? startDate
        : tempEnd
      : null;

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

  const heroImg = MONTH_IMAGES[viewDate.getMonth()];

  return (
    <main className={`wall-root ${darkTheme ? "theme-dark" : "theme-light"}`}>
      <div className="wall-card">
        {/* ── Spiral binding ── */}
        <div className="spiral-strip">
          {Array.from({ length: 13 }).map((_, i) => (
            <div key={i} className="spiral-ring" />
          ))}
        </div>

        {/* ── Hero image with diagonal overlay ── */}
        <div className="wall-hero">
          <Image
            src={heroImg}
            alt={monthName}
            fill
            sizes="(max-width: 860px) 100vw, 980px"
            className="hero-image"
            priority
          />
          {/* diagonal colour wedge — bottom-right, exactly like reference */}
          <div className="hero-wedge">
            <div className="hero-wedge-text">
              <span className="hero-year">{viewDate.getFullYear()}</span>
              <strong className="hero-month">{monthName.toUpperCase()}</strong>
            </div>
          </div>
        </div>

        {/* ── Calendar + Notes ── */}
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
              setViewDate(
                new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1)
              )
            }
            onNextMonth={() =>
              setViewDate(
                new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1)
              )
            }
            onDayHover={setHoveredDate}
            onDayClick={handleDayClick}
          />

          <NotesPanel
            darkTheme={darkTheme}
            startDate={startDate}
            endDate={endDate}
            notes={notes}
            onToggleTheme={() => setDarkTheme((v) => !v)}
            onNotesChange={setNotes}
          />
        </div>
      </div>
    </main>
  );
}