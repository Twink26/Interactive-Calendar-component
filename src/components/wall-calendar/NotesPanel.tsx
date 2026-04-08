import { formatDate } from "./date-utils";

type NotesPanelProps = {
  darkTheme: boolean;
  startDate: Date | null;
  endDate: Date | null;
  notes: string;
  onToggleTheme: () => void;
  onNotesChange: (value: string) => void;
};

export default function NotesPanel({
  darkTheme,
  startDate,
  endDate,
  notes,
  onToggleTheme,
  onNotesChange,
}: NotesPanelProps) {
  return (
    <aside className="notes-pane">
      <div className="notes-top">
        <h2>Notes</h2>
        <button type="button" className="mini-btn" onClick={onToggleTheme}>
          {darkTheme ? "Light theme" : "Dark theme"}
        </button>
      </div>

      <p className="selection-copy">
        {startDate && !endDate && `Start: ${formatDate(startDate)}`}
        {startDate && endDate && `Range: ${formatDate(startDate)} → ${formatDate(endDate)}`}
        {!startDate && "Pick a start and end day to create a focused plan."}
      </p>

      <textarea
        className="notes-input"
        placeholder="Write your memo, trip plan, or reminders..."
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
      />
      <p className="notes-footer">{notes.length} characters</p>
    </aside>
  );
}
