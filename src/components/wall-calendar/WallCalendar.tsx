"use client";


import { useMemo, useState } from "react";
import CalendarGrid from "./CalendarGrid";
import { monthMatrix, stripTime } from "./date-utils";
import NotesPanel from "./NotesPanel";

const MONTH_IMAGES: Record<number, string> = {
  0:  "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&q=80", 
  1:  "https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=1200&q=80",
  2:  "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1200&q=80", 
  3:  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80", 
  4:  "https://images.unsplash.com/photo-1504192010706-dd7f569ee2be?w=1200&q=80", 
  5:  "https://images.unsplash.com/photo-1446941611757-91d2c3bd3d45?w=1200&q=80",
  6:  "https://images.unsplash.com/photo-1465101162946-4377e57745c3?w=1200&q=80", 
  7:  "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1200&q=80", 
  8:  "https://images.unsplash.com/photo-1417577097439-425fb7dec05e?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Sep — Milky Way over mountains
  9:  "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=1200&q=80", 
  10: "https://images.unsplash.com/photo-1516331138075-f3adc1e149cd?q=80&w=1208&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Nov — star cluster
  11: "https://images.unsplash.com/photo-1462332420958-a05d1e002413?q=80&w=1507&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Dec — deep galaxy field
};
const DATE_NOTES_KEY = "wall-calendar-date-notes-v1";

function getStorageDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function readStoredDateNotes(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(DATE_NOTES_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, string>;
  } catch { return {}; }
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function WallCalendar() {
  const today = stripTime(new Date());
  const initialMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const initialDateNotes = readStoredDateNotes();

  const [viewDate, setViewDate] = useState(() => initialMonth);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [activeNoteDate, setActiveNoteDate] = useState<Date>(today);
  const [dateNotes, setDateNotes] = useState<Record<string, string>>(() => initialDateNotes);
  const [notes, setNotes] = useState(() => initialDateNotes[getStorageDateKey(today)] ?? "");
  const [darkTheme, setDarkTheme] = useState(false);

  const days = useMemo(() => monthMatrix(viewDate), [viewDate]);
  const monthTitle = viewDate.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const monthName = viewDate.toLocaleDateString(undefined, { month: "long" });
  const activeDateKey = getStorageDateKey(activeNoteDate);

  const tempEnd = startDate && !endDate ? hoveredDate : endDate;
  const rangeStart = startDate && tempEnd ? (startDate < tempEnd ? startDate : tempEnd) : null;
  const rangeEnd = startDate && tempEnd ? (startDate > tempEnd ? startDate : tempEnd) : null;

  function handleDayClick(day: Date, withRange: boolean) {
    const clean = stripTime(day);
    setActiveNoteDate(clean);
    setNotes(dateNotes[getStorageDateKey(clean)] ?? "");
    if (!withRange || !startDate) { setStartDate(clean); setEndDate(clean); return; }
    if (clean < startDate) { setEndDate(startDate); setStartDate(clean); return; }
    setEndDate(clean);
  }

  const heroImg = MONTH_IMAGES[viewDate.getMonth()];
  const savedNoteForDate = dateNotes[activeDateKey] ?? "";
  const noteIsDirty = notes !== savedNoteForDate;

  function changeMonth(nextDate: Date) {
    const clean = new Date(nextDate.getFullYear(), nextDate.getMonth(), 1);
    setViewDate(clean);
  }

  function handleSaveNote() {
    const trimmed = notes.trim();
    const next = { ...dateNotes };
    if (trimmed) {
      next[activeDateKey] = notes;
    } else {
      delete next[activeDateKey];
    }
    setDateNotes(next);
    window.localStorage.setItem(DATE_NOTES_KEY, JSON.stringify(next));
  }

  function handleDeleteSavedNote(noteKey: string) {
    const next = { ...dateNotes };
    delete next[noteKey];
    setDateNotes(next);
    window.localStorage.setItem(DATE_NOTES_KEY, JSON.stringify(next));

    if (noteKey === activeDateKey) {
      setNotes("");
    }
  }

  // Saved notes list for left panel
  const savedNotesList = Object.entries(dateNotes)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 4);

  return (
    <main className={`wall-root ${darkTheme ? "theme-dark" : "theme-light"}`}>
      <div className="wall-layout">

        {/* ── LEFT SIDEBAR ── */}
        <aside className="left-sidebar">

          {/* Big date display */}
          <div className="sidebar-date-block">
            <span className="sidebar-weekday">{WEEKDAYS[today.getDay()]}</span>
            <span className="sidebar-day-num">{activeNoteDate.getDate()}</span>
            <span className="sidebar-month-year">
              {MONTHS_SHORT[activeNoteDate.getMonth()]} {activeNoteDate.getFullYear()}
            </span>
          </div>

          {/* Saved notes */}
          <div className="sidebar-notes-block">
            <p className="sidebar-section-label">Saved Notes</p>
            {savedNotesList.length === 0 ? (
              <p className="sidebar-empty">No saved notes yet.</p>
            ) : (
              savedNotesList.map(([key, text]) => {
                const [yr, mo, day] = key.split("-");
                const label = `${MONTHS_SHORT[parseInt(mo, 10) - 1]} ${parseInt(day, 10)}, ${yr}`;
                return (
                  <div key={key} className="sidebar-note-card">
                    <div className="sidebar-note-head">
                      <span className="sidebar-note-month">{label}</span>
                      <button
                        type="button"
                        className="sidebar-note-delete"
                        onClick={() => handleDeleteSavedNote(key)}
                        aria-label={`Delete saved note for ${label}`}
                        title="Delete note"
                      >
                        <span aria-hidden="true">🗑</span>
                      </button>
                    </div>
                    <p className="sidebar-note-preview">
                      {text.length > 80 ? text.slice(0, 80) + "…" : text}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Instructions */}
          <div className="sidebar-instructions">
            <p className="sidebar-section-label">How to use</p>
            <ul className="sidebar-tip-list">
              <li>Click a date to select it.</li>
              <li>Shift + click for a range.</li>
              <li>Save notes per selected date.</li>
            </ul>
          </div>

          {/* Theme toggle — bottom of sidebar */}
          <div className="sidebar-toggle-wrap">
            <button
              type="button"
              className={`sidebar-theme-toggle ${darkTheme ? "is-dark" : "is-light"}`}
              onClick={() => setDarkTheme(v => !v)}
              aria-label={`Switch to ${darkTheme ? "light" : "dark"} theme`}
              aria-pressed={darkTheme}
            >
              <span className="stt-icon">
                {darkTheme ? (
                  // Moon
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                ) : (
                  // Sun
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5"/>
                    <line x1="12" y1="1" x2="12" y2="3"/>
                    <line x1="12" y1="21" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                    <line x1="1" y1="12" x2="3" y2="12"/>
                    <line x1="21" y1="12" x2="23" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                  </svg>
                )}
              </span>
              <span className="stt-track">
                <span className="stt-knob" />
              </span>
              <span className="stt-label">{darkTheme ? "Dark" : "Light"}</span>
            </button>
          </div>
        </aside>

        {/* ── CALENDAR SHELL ── */}
        <div className="calendar-shell">
          <div className="wall-card">
            <div className="wall-hero">
            <img
  src={heroImg}
  alt={monthName}
  className="hero-image"
/>
              <div className="hero-wedge">
                <div className="hero-wedge-text">
                  <span className="hero-year">{viewDate.getFullYear()}</span>
                  <strong className="hero-month">{monthName.toUpperCase()}</strong>
                </div>
              </div>
            </div>

            <div className="wall-content">
              <CalendarGrid
                monthTitle={monthTitle}
                days={days}
                today={today}
                startDate={startDate}
                endDate={endDate}
                rangeStart={rangeStart}
                rangeEnd={rangeEnd}
                onPrevMonth={() => changeMonth(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
                onNextMonth={() => changeMonth(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
                onDayHover={setHoveredDate}
                onDayClick={handleDayClick}
              />
              <NotesPanel
                monthTitle={monthTitle}
                startDate={startDate}
                endDate={endDate}
                notes={notes}
                onNotesChange={setNotes}
                onSaveNote={handleSaveNote}
                hasSavedNote={Boolean(savedNoteForDate)}
                noteIsDirty={noteIsDirty}
              />
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}