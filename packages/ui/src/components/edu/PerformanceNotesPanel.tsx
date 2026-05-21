import { useEffect, useState } from "react";

export type PerformanceNotesPanelProps = {
  studentId: string;
  authToken: string;
};

export function PerformanceNotesPanel({ studentId, authToken }: PerformanceNotesPanelProps) {
  const [notes, setNotes] = useState<Array<{ id: string; note: string; strengths: string; weaknesses: string; recommendations: string; behavioralNotes: string; createdAt: string }>>([]);
  const [form, setForm] = useState({
    note: "",
    strengths: "",
    weaknesses: "",
    recommendations: "",
    behavioralNotes: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void fetch(`/api/performance-notes/student/${encodeURIComponent(studentId)}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })
      .then((response) => response.json())
      .then((payload) => {
        if (payload?.data) {
          setNotes(payload.data);
        }
      })
      .catch(() => setMessage("Unable to load performance notes."));
  }, [authToken, studentId]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((state) => ({ ...state, [field]: value }));
  };

  const handleSubmit = () => {
    setSaving(true);
    setMessage(null);

    void fetch("/api/performance-notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ studentId, ...form }),
    })
      .then((response) => response.json())
      .then((payload) => {
        if (payload?.success) {
          setNotes((current) => [payload.data, ...current]);
          setForm({ note: "", strengths: "", weaknesses: "", recommendations: "", behavioralNotes: "" });
          setMessage("Performance note submitted successfully.");
        } else {
          setMessage(payload?.message ?? "Unable to submit performance note.");
        }
      })
      .catch(() => setMessage("Unable to submit performance note."))
      .finally(() => setSaving(false));
  };

  return (
    <div>
      <h2>Performance Notes</h2>
      {message ? <p>{message}</p> : null}
      <div style={{ display: "grid", gap: 12, marginBottom: 24 }}>
        <textarea
          placeholder="Summary note"
          value={form.note}
          onChange={(event) => handleChange("note", event.target.value)}
          rows={4}
          style={{ width: "100%" }}
        />
        <textarea
          placeholder="Strengths"
          value={form.strengths}
          onChange={(event) => handleChange("strengths", event.target.value)}
          rows={2}
          style={{ width: "100%" }}
        />
        <textarea
          placeholder="Weaknesses"
          value={form.weaknesses}
          onChange={(event) => handleChange("weaknesses", event.target.value)}
          rows={2}
          style={{ width: "100%" }}
        />
        <textarea
          placeholder="Recommendations"
          value={form.recommendations}
          onChange={(event) => handleChange("recommendations", event.target.value)}
          rows={2}
          style={{ width: "100%" }}
        />
        <textarea
          placeholder="Behavioral notes"
          value={form.behavioralNotes}
          onChange={(event) => handleChange("behavioralNotes", event.target.value)}
          rows={2}
          style={{ width: "100%" }}
        />
        <button type="button" disabled={saving} onClick={handleSubmit}>
          Submit note
        </button>
      </div>
      <div>
        <h3>History</h3>
        {notes.length === 0 ? (
          <p>No performance notes yet.</p>
        ) : (
          notes.map((note) => (
            <article key={note.id} style={{ marginBottom: 16, padding: 12, border: "1px solid #ddd" }}>
              <small>{note.createdAt}</small>
              <p><strong>Note:</strong> {note.note}</p>
              <p><strong>Strengths:</strong> {note.strengths}</p>
              <p><strong>Weaknesses:</strong> {note.weaknesses}</p>
              <p><strong>Recommendations:</strong> {note.recommendations}</p>
              <p><strong>Behavioral Notes:</strong> {note.behavioralNotes}</p>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
