import { formatDate } from "./date-utils";

type NotesPanelProps = {
  monthTitle: string;
  startDate: Date | null;
  endDate: Date | null;
  notes: string;
  onNotesChange: (value: string) => void;
  onSaveNote: () => void;
  hasSavedNote: boolean;
  noteIsDirty: boolean;
};

export default function NotesPanel({
  monthTitle,
  startDate,
  endDate,
  notes,
  onNotesChange,
  onSaveNote,
  hasSavedNote,
  noteIsDirty,
}: NotesPanelProps) {
  return (
    <aside className="notes-pane">
      <div className="notes-top">
        <h2>Notes</h2>
        <button type="button" className="mini-btn" onClick={onSaveNote}>
          Save Note
        </button>
      </div>
      <p className="notes-month-tag">{monthTitle}</p>

      <p className="selection-copy">
        {startDate && !endDate && `Start: ${formatDate(startDate)}`}
        {startDate && endDate && startDate.getTime() === endDate.getTime() && `Date: ${formatDate(startDate)}`}
        {startDate && endDate && startDate.getTime() !== endDate.getTime() &&
          `Range: ${formatDate(startDate)} → ${formatDate(endDate)}`}
        {!startDate && "Pick a start and end day to create a focused plan."}
      </p>

      <textarea
        className="notes-input"
        placeholder="Write your memo, trip plan, or reminders..."
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
      />
      <p className="notes-footer">
        {notes.length} characters
        {" • "}
        {noteIsDirty ? "Unsaved changes" : hasSavedNote ? "Saved for this date" : "No saved note"}
      </p>
    </aside>
  );
}
