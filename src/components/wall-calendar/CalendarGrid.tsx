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
  onDayClick: (date: Date) => void;
};

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
  return (
    <section className="calendar-pane">
      <div className="calendar-toolbar">
        <button type="button" className="mini-btn" onClick={onPrevMonth}>
          ← Prev
        </button>
        <strong>{monthTitle}</strong>
        <button type="button" className="mini-btn" onClick={onNextMonth}>
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
          const holiday = getHolidayLabel(date);
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
              onMouseEnter={() => onDayHover(stripTime(date))}
              onMouseLeave={() => onDayHover(null)}
              onClick={() => onDayClick(date)}
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
  );
}
