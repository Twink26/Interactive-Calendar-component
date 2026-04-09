"use client";

import { useEffect, useRef, useState } from "react";
import { WEEK_DAYS } from "./constants";
import { formatDate, getHolidayLabel, isSameDay, stripTime } from "./date-utils";
import { DayCell } from "./types";

type CalendarGridProps = {
  monthTitle: string;
  days: DayCell[];
  today: Date;
  startDate: Date | null;
  endDate: Date | null;
  rangeStart: Date | null;
  rangeEnd: Date | null;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDayHover: (date: Date | null) => void;
  onDayClick: (date: Date, withRange: boolean) => void;
};

type FlipState = "idle" | "flipping-out" | "flipping-in";

export default function CalendarGrid({
  monthTitle,
  days,
  today,
  startDate,
  endDate,
  rangeStart,
  rangeEnd,
  onPrevMonth,
  onNextMonth,
  onDayHover,
  onDayClick,
}: CalendarGridProps) {
  // What is currently rendered inside the flip page
  const [visibleTitle, setVisibleTitle] = useState(monthTitle);
  const [visibleDays, setVisibleDays] = useState<DayCell[]>(days);

  const [flipState, setFlipState] = useState<FlipState>("idle");
  const [flipDir, setFlipDir] = useState<"prev" | "next">("next");

  // Store the pending navigate callback so we can call it at the right moment
  const pendingNavigate = useRef<(() => void) | null>(null);

  // When parent sends new data (after navigate was called), store it
  // but don't show it yet — we show it when flip-out ends
  const incomingTitle = useRef(monthTitle);
  const incomingDays = useRef(days);

  useEffect(() => {
    // Only update incoming refs when we are expecting new data (flipping-out)
    // OR when idle (initial load / external change)
    incomingTitle.current = monthTitle;
    incomingDays.current = days;

    if (flipState === "idle") {
      setVisibleTitle(monthTitle);
      setVisibleDays(days);
    }
  }, [monthTitle, days]); // eslint-disable-line react-hooks/exhaustive-deps

  function triggerFlip(dir: "prev" | "next", navigate: () => void) {
    if (flipState !== "idle") return;
    pendingNavigate.current = navigate;
    setFlipDir(dir);
    setFlipState("flipping-out");
  }

  function handleAnimationEnd() {
    if (flipState === "flipping-out") {
      // 1. Call navigate now — parent state updates, useEffect fires,
      //    incoming refs get the new month data
      if (pendingNavigate.current) {
        pendingNavigate.current();
        pendingNavigate.current = null;
      }
      // 2. Small timeout so React can flush the state update and
      //    populate incomingTitle/incomingDays before we swap
      setTimeout(() => {
        setVisibleTitle(incomingTitle.current);
        setVisibleDays(incomingDays.current);
        setFlipState("flipping-in");
      }, 20);
    } else if (flipState === "flipping-in") {
      setFlipState("idle");
    }
  }

  return (
    <section className="calendar-pane">
      {/* Toolbar stays outside the flip so the title updates instantly */}
      <div className="calendar-toolbar">
        <button
          type="button"
          className="mini-btn"
          onClick={() => triggerFlip("prev", onPrevMonth)}
          disabled={flipState !== "idle"}
        >
          ← Prev
        </button>
        <strong>{monthTitle}</strong>
        <button
          type="button"
          className="mini-btn"
          onClick={() => triggerFlip("next", onNextMonth)}
          disabled={flipState !== "idle"}
        >
          Next →
        </button>
      </div>

      {/* 3-D flip stage */}
      <div className="flip-stage">
        <div
          className={[
            "flip-page",
            flipState === "flipping-out" ? `flip-out-${flipDir}` : "",
            flipState === "flipping-in"  ? `flip-in-${flipDir}`  : "",
          ].filter(Boolean).join(" ")}
          onAnimationEnd={handleAnimationEnd}
        >
          {/* Front face — calendar content */}
          <div className="flip-face flip-front">
            <div className="week-row">
              {WEEK_DAYS.map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>

            <div className="calendar-grid">
              {visibleDays.map(({ date, inCurrentMonth }, idx) => {
                const holiday = getHolidayLabel(date);
                const isStart   = isSameDay(startDate, date);
                const isEnd     = isSameDay(endDate, date);
                const isToday   = isSameDay(today, date);
                const isInRange =
                  !!rangeStart &&
                  !!rangeEnd &&
                  stripTime(date) > stripTime(rangeStart) &&
                  stripTime(date) < stripTime(rangeEnd);

                const colIndex   = idx % 7;
                const isRowStart = colIndex === 0;
                const isRowEnd   = colIndex === 6;

                return (
                  <button
                    key={date.toISOString()}
                    type="button"
                    onMouseEnter={() => onDayHover(stripTime(date))}
                    onMouseLeave={() => onDayHover(null)}
                    onClick={(e) => onDayClick(date, e.shiftKey)}
                    className={[
                      "day-cell",
                      inCurrentMonth ? "current" : "faded",
                      isToday    ? "today"       : "",
                      isInRange  ? "in-range"    : "",
                      isStart    ? "range-start" : "",
                      isEnd      ? "range-end"   : "",
                      (isInRange || isStart || isEnd) && isRowStart ? "row-edge-left"  : "",
                      (isInRange || isStart || isEnd) && isRowEnd   ? "row-edge-right" : "",
                    ].filter(Boolean).join(" ")}
                    aria-label={formatDate(date)}
                  >
                    <span>{date.getDate()}</span>
                    {holiday && <small title={holiday}>●</small>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Back face — paper underside shown mid-flip */}
          <div className="flip-face flip-back">
            <div className="flip-back-lines">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flip-back-line" />
              ))}
            </div>
          </div>
        </div>

        {/* Shadow overlay during flip */}
        {flipState !== "idle" && (
          <div className={`flip-shadow flip-shadow-${flipDir}`} />
        )}
      </div>
    </section>
  );
}