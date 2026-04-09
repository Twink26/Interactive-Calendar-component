"use client";

import { useEffect, useRef, useState } from "react";
import { WEEK_DAYS } from "./constants";
import { formatDate, getHolidayInfo, isSameDay, stripTime } from "./date-utils";
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
  const [visibleTitle, setVisibleTitle] = useState(monthTitle);
  const [visibleDays,  setVisibleDays]  = useState<DayCell[]>(days);
  const [flipState,    setFlipState]    = useState<FlipState>("idle");
  const [flipDir,      setFlipDir]      = useState<"prev" | "next">("next");

  const pendingNavigate  = useRef<(() => void) | null>(null);
  const incomingTitle    = useRef(monthTitle);
  const incomingDays     = useRef(days);

  useEffect(() => {
    incomingTitle.current = monthTitle;
    incomingDays.current  = days;
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
      if (pendingNavigate.current) {
        pendingNavigate.current();
        pendingNavigate.current = null;
      }
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
      <div className="calendar-toolbar">
        <button
          type="button"
          className="mini-btn"
          onClick={() => triggerFlip("prev", onPrevMonth)}
          disabled={flipState !== "idle"}
          aria-label="Previous month"
        >
          ← Prev
        </button>
        <strong>{monthTitle}</strong>
        <button
          type="button"
          className="mini-btn"
          onClick={() => triggerFlip("next", onNextMonth)}
          disabled={flipState !== "idle"}
          aria-label="Next month"
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
          {/* Front face */}
          <div className="flip-face flip-front">
            <div className="week-row">
              {WEEK_DAYS.map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>

            <div className="calendar-grid">
              {visibleDays.map(({ date, inCurrentMonth }, idx) => {
                const holiday  = getHolidayInfo(date);
                const isStart  = isSameDay(startDate, date);
                const isEnd    = isSameDay(endDate,   date);
                const isToday  = isSameDay(today,     date);
                const isInRange =
                  !!rangeStart &&
                  !!rangeEnd   &&
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
                      inCurrentMonth ? "current"     : "faded",
                      isToday        ? "today"       : "",
                      isInRange      ? "in-range"    : "",
                      isStart        ? "range-start" : "",
                      isEnd          ? "range-end"   : "",
                      holiday        ? "has-holiday" : "",
                      (isInRange || isStart || isEnd) && isRowStart ? "row-edge-left"  : "",
                      (isInRange || isStart || isEnd) && isRowEnd   ? "row-edge-right" : "",
                    ].filter(Boolean).join(" ")}
                    aria-label={`${formatDate(date)}${holiday ? ` — ${holiday.label}` : ""}`}
                    title={holiday?.label}
                  >
                    <span>{date.getDate()}</span>
                    {holiday && (
                      <span
                        className="holiday-dot"
                        style={{ background: holiday.color }}
                        aria-hidden="true"
                      />
                    )}
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