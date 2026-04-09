"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  8:  "https://images.unsplash.com/photo-1417577097439-425fb7dec05e?w=1200&q=80",
  9:  "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=1200&q=80",
  10: "https://images.unsplash.com/photo-1516331138075-f3adc1e149cd?w=1200&q=80",
  11: "https://images.unsplash.com/photo-1462332420958-a05d1e002413?w=1200&q=80",
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

// ─── Colour math ─────────────────────────────────────────────────────────────

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [h / 6, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ];
}

function wcagLuminance(r: number, g: number, b: number): number {
  return [r, g, b].reduce((sum, c, i) => {
    const v = c / 255;
    const linear = v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    return sum + linear * [0.2126, 0.7152, 0.0722][i];
  }, 0);
}

function contrastRatio(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  const l1 = wcagLuminance(r1, g1, b1), l2 = wcagLuminance(r2, g2, b2);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

export interface ThemePalette {
  accent:      string; // vivid hue — buttons, rings, accents
  accentLight: string; // translucent wash — range bands, focus glows
  accentText:  string; // text ON accent (WCAG AA)
  bg:          string; // page background
  card:        string; // panel / card surface
  sidebar:     string; // sidebar surface
  fg:          string; // primary body text
  border:      string; // dividers and outlines
  muted:       string; // secondary / label text
  inputBg:     string; // textarea background
}

/**
 * Draws the image into a 20×20 canvas, averages pixels, then derives a
 * complete 10-role colour palette from that single hue anchor.
 */
function extractPalette(
  src: string,
  onSuccess: (p: ThemePalette) => void,
  onError?: () => void
) {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = src.includes("?") ? `${src}&_cb=${Date.now()}` : `${src}?_cb=${Date.now()}`;

  img.onload = () => {
    try {
      const SIZE = 20;
      const canvas = document.createElement("canvas");
      canvas.width = SIZE; canvas.height = SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) { onError?.(); return; }
      ctx.drawImage(img, 0, 0, SIZE, SIZE);

      const { data } = ctx.getImageData(0, 0, SIZE, SIZE);
      let rSum = 0, gSum = 0, bSum = 0;
      const count = SIZE * SIZE;
      for (let i = 0; i < data.length; i += 4) {
        rSum += data[i]; gSum += data[i + 1]; bSum += data[i + 2];
      }
      const avgR = rSum / count, avgG = gSum / count, avgB = bSum / count;

      // Anchor hue — enforce a minimum saturation floor so desaturated/muted
      // photos (greyscale skies, snowscapes, etc.) still produce a visible hue.
      const [h, rawS, rawL] = rgbToHsl(avgR, avgG, avgB);
      const s = Math.max(rawS, 0.30);

      // ── Decide whether the image is predominantly dark or light ──────────
      // For dark images (nebulas, night sky, deep forest) we want dark surfaces
      // so they feel cohesive with the hero, not jarring light-on-dark.
      const isDark = rawL < 0.45;

      // ── Surface lightness spreads ────────────────────────────────────────
      // Light images  → bg ~0.91, sidebar ~0.87, card ~0.97, input ~0.99
      // Dark  images  → bg ~0.14, sidebar ~0.10, card ~0.19, input ~0.22
      // This gives ~6-9 % lightness separation between each surface so they
      // look visibly distinct rather than identical flat grey / white.
      const bgL      = isDark ? 0.14 : 0.91;
      const sidebarL = isDark ? 0.10 : 0.87;
      const cardL    = isDark ? 0.19 : 0.97;
      const inputL   = isDark ? 0.22 : 0.995;

      // Saturation on surfaces: dark images get more saturation so colours pop;
      // light images keep it moderate so text stays readable.
      const surfaceS = isDark
        ? Math.min(s * 0.55, 0.60)
        : Math.min(s * 0.40, 0.45);

      // ── Accent — vivid, mid-dark ─────────────────────────────────────────
      const accentL = isDark ? 0.55 : 0.36;
      const [ar, ag, ab]        = hslToRgb(h, Math.min(s * 1.3, 0.90), accentL);

      // ── Surfaces ─────────────────────────────────────────────────────────
      const [bgr,  bgg,  bgb]   = hslToRgb(h, surfaceS * 0.55, bgL);
      const [cr,   cg,   cb]    = hslToRgb(h, surfaceS * 0.30, cardL);
      const [sibr, sibg, sibb]  = hslToRgb(h, surfaceS * 0.45, sidebarL);
      const [ir,   ig,   ib]    = hslToRgb(h, surfaceS * 0.20, inputL);

      // ── Foreground text ───────────────────────────────────────────────────
      const fgL = isDark ? 0.88 : 0.11;
      const [fgr, fgg, fgb]     = hslToRgb(h, Math.min(s * 0.35, 0.40), fgL);

      // ── Border ────────────────────────────────────────────────────────────
      const borderL = isDark ? 0.30 : 0.78;
      const [bdr, bdg, bdb]     = hslToRgb(h, Math.min(s * 0.45, 0.55), borderL);

      // ── Muted text ────────────────────────────────────────────────────────
      const mutedL = isDark ? 0.62 : 0.48;
      const [mr, mg, mb]        = hslToRgb(h, Math.min(s * 0.30, 0.40), mutedL);

      // Pick accent text colour that guarantees best WCAG contrast
      const contrastW = contrastRatio(ar, ag, ab, 255, 255, 255);
      const contrastD = contrastRatio(ar, ag, ab, fgr, fgg, fgb);
      const accentText = contrastW >= contrastD ? "#ffffff" : `rgb(${fgr},${fgg},${fgb})`;

      onSuccess({
        accent:      `rgb(${ar},${ag},${ab})`,
        accentLight: `rgba(${ar},${ag},${ab},0.14)`,
        accentText,
        bg:      `rgb(${bgr},${bgg},${bgb})`,
        card:    `rgb(${cr},${cg},${cb})`,
        sidebar: `rgb(${sibr},${sibg},${sibb})`,
        fg:      `rgb(${fgr},${fgg},${fgb})`,
        border:  `rgb(${bdr},${bdg},${bdb})`,
        muted:   `rgb(${mr},${mg},${mb})`,
        inputBg: `rgb(${ir},${ig},${ib})`,
      });
    } catch (e) {
      console.warn("Palette extraction failed:", e);
      onError?.();
    }
  };
  img.onerror = () => { console.warn("Hero image load error"); onError?.(); };
}

// Neutral default shown before first extraction completes.
// Uses a noticeable teal tint so the layout looks intentional before
// the first hero image palette kicks in.
const DEFAULT_PALETTE: ThemePalette = {
  accent:      "rgb(57,91,100)",
  accentLight: "rgba(57,91,100,0.14)",
  accentText:  "#ffffff",
  bg:          "rgb(210,232,229)",   // clearly tinted, not flat grey
  card:        "rgb(240,250,248)",   // lighter than bg — visible card lift
  sidebar:     "rgb(196,221,218)",   // darker than bg — visible sidebar depth
  fg:          "rgb(18,36,40)",
  border:      "rgb(140,185,187)",
  muted:       "rgb(88,128,134)",
  inputBg:     "rgb(250,254,254)",
};

const WEEKDAYS     = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function WallCalendar() {
  const today            = stripTime(new Date());
  const initialMonth     = new Date(today.getFullYear(), today.getMonth(), 1);
  const initialDateNotes = readStoredDateNotes();

  const [viewDate,       setViewDate]       = useState(() => initialMonth);
  const [startDate,      setStartDate]      = useState<Date | null>(null);
  const [endDate,        setEndDate]        = useState<Date | null>(null);
  const [hoveredDate,    setHoveredDate]    = useState<Date | null>(null);
  const [activeNoteDate, setActiveNoteDate] = useState<Date>(today);
  const [dateNotes,      setDateNotes]      = useState<Record<string, string>>(() => initialDateNotes);
  const [notes,          setNotes]          = useState(() => initialDateNotes[getStorageDateKey(today)] ?? "");

  // Hero cross-fade — two image layers swapped alternately
  const [heroA,     setHeroA]     = useState(MONTH_IMAGES[today.getMonth()]);
  const [heroB,     setHeroB]     = useState(MONTH_IMAGES[today.getMonth()]);
  const [heroLayer, setHeroLayer] = useState<"a" | "b">("a");
  const heroLock = useRef(false);

  // Full dynamic palette
  const [palette, setPalette] = useState<ThemePalette>(DEFAULT_PALETTE);

  const days       = useMemo(() => monthMatrix(viewDate), [viewDate]);
  const monthTitle = viewDate.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const monthName  = viewDate.toLocaleDateString(undefined, { month: "long" });
  const activeDateKey = getStorageDateKey(activeNoteDate);
  const heroImg    = MONTH_IMAGES[viewDate.getMonth()];

  // On month change → cross-fade hero image + re-derive palette
  useEffect(() => {
    if (heroLock.current) return;
    heroLock.current = true;

    const nextSrc = heroImg;
    const preload = new Image();
    preload.crossOrigin = "anonymous";
    preload.src = nextSrc;

    preload.onload = () => {
      if (heroLayer === "a") {
        setHeroB(nextSrc);
        requestAnimationFrame(() => requestAnimationFrame(() => {
          setHeroLayer("b");
          setTimeout(() => { heroLock.current = false; }, 750);
        }));
      } else {
        setHeroA(nextSrc);
        requestAnimationFrame(() => requestAnimationFrame(() => {
          setHeroLayer("a");
          setTimeout(() => { heroLock.current = false; }, 750);
        }));
      }
    };
    preload.onerror = () => { heroLock.current = false; };

    // Extract palette independently (doesn't need to wait for cross-fade)
    extractPalette(nextSrc, setPalette);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heroImg]);

  const tempEnd    = startDate && !endDate ? hoveredDate : endDate;
  const rangeStart = startDate && tempEnd ? (startDate < tempEnd ? startDate : tempEnd) : null;
  const rangeEnd   = startDate && tempEnd ? (startDate > tempEnd ? startDate : tempEnd) : null;

  function handleDayClick(day: Date, withRange: boolean) {
    const clean = stripTime(day);
    setActiveNoteDate(clean);
    setNotes(dateNotes[getStorageDateKey(clean)] ?? "");
    if (!withRange || !startDate) { setStartDate(clean); setEndDate(clean); return; }
    if (clean < startDate) { setEndDate(startDate); setStartDate(clean); return; }
    setEndDate(clean);
  }

  const savedNoteForDate = dateNotes[activeDateKey] ?? "";
  const noteIsDirty = notes !== savedNoteForDate;

  function changeMonth(nextDate: Date) {
    setViewDate(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));
  }

  function handleSaveNote() {
    const trimmed = notes.trim();
    const next = { ...dateNotes };
    if (trimmed) next[activeDateKey] = notes; else delete next[activeDateKey];
    setDateNotes(next);
    window.localStorage.setItem(DATE_NOTES_KEY, JSON.stringify(next));
  }

  function handleDeleteSavedNote(noteKey: string) {
    const next = { ...dateNotes };
    delete next[noteKey];
    setDateNotes(next);
    window.localStorage.setItem(DATE_NOTES_KEY, JSON.stringify(next));
    if (noteKey === activeDateKey) setNotes("");
  }

  const savedNotesList = Object.entries(dateNotes)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 4);

  // All CSS variables injected at the root — every child component reads them
  const cssVars = {
    "--accent":       palette.accent,
    "--accent-light": palette.accentLight,
    "--accent-text":  palette.accentText,
    "--bg":           palette.bg,
    "--card":         palette.card,
    "--sidebar":      palette.sidebar,
    "--fg":           palette.fg,
    "--border":       palette.border,
    "--muted":        palette.muted,
    "--input-bg":     palette.inputBg,
  } as React.CSSProperties;

  return (
    <main className="wall-root" style={cssVars}>
      <div className="wall-layout">

        {/* ── LEFT SIDEBAR ── */}
        <aside className="left-sidebar">
          <div className="sidebar-date-block">
            <span className="sidebar-weekday">{WEEKDAYS[today.getDay()]}</span>
            <span className="sidebar-day-num">{activeNoteDate.getDate()}</span>
            <span className="sidebar-month-year">
              {MONTHS_SHORT[activeNoteDate.getMonth()]} {activeNoteDate.getFullYear()}
            </span>
          </div>

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
                        aria-label={`Delete note for ${label}`}
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

          <div className="sidebar-instructions">
            <p className="sidebar-section-label">How to use</p>
            <ul className="sidebar-tip-list">
              <li>Click a date to select it.</li>
              <li>Shift + click for a range.</li>
              <li>Save notes per selected date.</li>
            </ul>
          </div>
        </aside>

        {/* ── CALENDAR SHELL ── */}
        <div className="calendar-shell">
          <div className="wall-card">

            {/* ── Hero image cross-fade ── */}
            <div className="wall-hero">
              <img src={heroA} alt={monthName} className="hero-layer"
                   style={{ opacity: heroLayer === "a" ? 1 : 0 }} />
              <img src={heroB} alt={monthName} className="hero-layer"
                   style={{ opacity: heroLayer === "b" ? 1 : 0 }} />
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