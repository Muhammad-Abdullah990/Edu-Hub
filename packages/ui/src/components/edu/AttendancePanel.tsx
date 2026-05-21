import { useEffect, useMemo, useState } from "react";

export type AttendancePanelProps = {
  classId: string;
  section?: string;
  date?: string;
  authToken: string;
};

export function AttendancePanel({
  classId,
  section,
  date,
  authToken,
}: AttendancePanelProps) {
  const [records, setRecords] = useState<Array<{
    studentId: string;
    studentCode: string;
    fullName: string;
    class: string;
    section: string;
    status: string | null;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const selectedDate = date ?? new Date().toISOString().slice(0, 10);

  const statusMap = useMemo(
    () => new Map(records.map((item) => [item.studentId, item.status ?? "absent"])),
    [records],
  );

  useEffect(() => {
    setLoading(true);
    void fetch(
      `/api/attendance/class/${encodeURIComponent(classId)}?date=${encodeURIComponent(
        selectedDate,
      )}${section ? `&section=${encodeURIComponent(section)}` : ""}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    )
      .then((response) => response.json())
      .then((payload) => {
        if (payload?.data) {
          setRecords(payload.data);
        }
      })
      .catch(() => setMessage("Unable to load attendance records."))
      .finally(() => setLoading(false));
  }, [authToken, classId, section, selectedDate]);

  const updateStatus = (studentId: string, status: string) => {
    setRecords((current) =>
      current.map((item) =>
        item.studentId === studentId ? { ...item, status } : item,
      ),
    );
  };

  const handleMarkAllPresent = () => {
    setRecords((current) => current.map((item) => ({ ...item, status: "present" })));
  };

  const handleReset = () => {
    setRecords((current) => current.map((item) => ({ ...item, status: "absent" })));
  };

  const handleSave = () => {
    setSaving(true);
    const items = records.map((record) => ({
      studentId: record.studentId,
      date: selectedDate,
      status: (record.status as "present" | "absent") ?? "absent",
    }));

    void fetch("/api/attendance/mark-bulk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ class: classId, section, date: selectedDate, items }),
    })
      .then((response) => response.json())
      .then((payload) => {
        if (payload?.success) {
          setMessage("Attendance saved successfully.");
        } else {
          setMessage(payload?.message ?? "Unable to save attendance.");
        }
      })
      .catch(() => setMessage("Unable to save attendance."))
      .finally(() => setSaving(false));
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <h2>Attendance for {classId}</h2>
        <span>{selectedDate}</span>
      </div>
      <div style={{ marginBottom: 16 }}>
        <button type="button" onClick={handleMarkAllPresent} disabled={loading || saving}>
          Mark all present
        </button>
        <button type="button" onClick={handleReset} disabled={loading || saving}>
          Reset
        </button>
        <button type="button" onClick={handleSave} disabled={loading || saving}>
          Save attendance
        </button>
      </div>
      {message ? <p>{message}</p> : null}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: 8 }}>Student</th>
              <th style={{ textAlign: "left", padding: 8 }}>Class</th>
              <th style={{ textAlign: "left", padding: 8 }}>Section</th>
              <th style={{ textAlign: "left", padding: 8 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} style={{ padding: 8 }}>
                  Loading attendance...
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: 8 }}>
                  No students found.
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record.studentId}>
                  <td style={{ padding: 8 }}>{record.fullName}</td>
                  <td style={{ padding: 8 }}>{record.class}</td>
                  <td style={{ padding: 8 }}>{record.section}</td>
                  <td style={{ padding: 8 }}>
                    <select
                      value={record.status ?? "absent"}
                      onChange={(event) =>
                        updateStatus(record.studentId, event.target.value)
                      }
                      disabled={saving}
                    >
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
