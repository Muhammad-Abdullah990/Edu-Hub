import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

export type AttendancePanelProps = {
  classId?: string;
  date?: string;
  authToken: string;
};

export function AttendancePanel({
  classId,
  date: initialDate,
  authToken,
}: AttendancePanelProps) {
  const [records, setRecords] = useState<Array<{
    studentId: string;
    studentCode: string;
    fullName: string;
    class: string;
    status: string | null;
  }>>([]);
  const [historyRecords, setHistoryRecords] = useState<Array<{
    studentId: string;
    studentCode: string;
    fullName: string;
    class: string;
    section: string;
    status: string | null;
    attendanceDate: string | null;
    markedBy: string | null;
  }>>([]);
  const [selectedHistoryStudentId, setSelectedHistoryStudentId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"today" | "history">("today");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(initialDate ?? new Date().toISOString().slice(0, 10));

  const navigateDay = useCallback((direction: -1 | 1) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + direction);
    setSelectedDate(d.toISOString().slice(0, 10));
  }, [selectedDate]);

  const handleDatePickerChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  }, []);

  const filteredRecords = useMemo(() => {
    if (!searchQuery) return records;
    const lower = searchQuery.toLowerCase();
    return records.filter(
      (r) =>
        r.fullName.toLowerCase().includes(lower) ||
        r.studentCode.toLowerCase().includes(lower),
    );
  }, [records, searchQuery]);

  useEffect(() => {
    setLoading(true);
    setMessage(null);
    const url = classId
      ? `/api/attendance/class/${encodeURIComponent(classId)}?date=${encodeURIComponent(selectedDate)}`
      : `/api/attendance/all?date=${encodeURIComponent(selectedDate)}`;
    void fetch(url, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then((response) => response.json())
      .then((payload) => {
        if (payload?.data) {
          setRecords(payload.data);
        }
      })
      .catch(() => {
        setMessage("Unable to load attendance records.");
        setMessageType("error");
      })
      .finally(() => setLoading(false));
  }, [authToken, classId, selectedDate]);

  useEffect(() => {
    if (viewMode !== "history" || !selectedHistoryStudentId) {
      return;
    }

    setHistoryLoading(true);
    setHistoryError(null);
    void fetch(`/api/attendance/student/${encodeURIComponent(selectedHistoryStudentId)}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then((response) => response.json())
      .then((payload) => {
        if (payload?.data) {
          setHistoryRecords(payload.data);
        } else {
          setHistoryError("Unable to load attendance history.");
          setHistoryRecords([]);
        }
      })
      .catch(() => {
        setHistoryError("Unable to load attendance history.");
        setHistoryRecords([]);
      })
      .finally(() => setHistoryLoading(false));
  }, [authToken, selectedHistoryStudentId, viewMode]);

  useEffect(() => {
    if (!selectedHistoryStudentId && records.length > 0) {
      setSelectedHistoryStudentId(records[0].studentId);
    }
  }, [records, selectedHistoryStudentId]);

  const updateStatus = (studentId: string, status: string) => {
    setRecords((current) =>
      current.map((item) =>
        item.studentId === studentId ? { ...item, status } : item,
      ),
    );
  };

  const handleMarkAllPresent = () => {
    setRecords((current) => current.map((item) => ({ ...item, status: "present" })));
    setMessage("Marked all students as present.");
    setMessageType("success");
  };

  const handleReset = () => {
    setRecords((current) => current.map((item) => ({ ...item, status: "absent" })));
    setMessage("Reset all attendance to absent.");
    setMessageType("info");
  };

  const handleSave = () => {
    setSaving(true);
    setMessage(null);
    const items = records.map((record) => ({
      studentId: record.studentId,
      date: selectedDate,
      status: (record.status === "present" || record.status === "absent" || record.status === "leave" ? record.status : "absent") as "present" | "absent" | "leave",
    }));

    const body = classId
      ? JSON.stringify({ class: classId, date: selectedDate, items })
      : JSON.stringify({ date: selectedDate, items });

    void fetch("/api/attendance/mark-bulk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body,
    })
      .then((response) => response.json())
      .then((payload) => {
        if (payload?.success) {
          setMessage("Attendance saved successfully.");
          setMessageType("success");
        } else {
          setMessage(payload?.message ?? "Unable to save attendance.");
          setMessageType("error");
        }
      })
      .catch(() => {
        setMessage("Unable to save attendance.");
        setMessageType("error");
      })
      .finally(() => setSaving(false));
  };

  const presentCount = records.filter((r) => r.status === "present").length;
  const absentCount = records.filter((r) => r.status === "absent").length;
  const leaveCount = records.filter((r) => r.status === "leave").length;

  const messageStyles = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-900",
    error: "bg-red-50 border-red-200 text-red-900",
    info: "bg-blue-50 border-blue-200 text-blue-900",
  };

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-semibold text-slate-900">
              Attendance - {viewMode === "today" ? "All Students" : "Student History"}
            </h2>
            <div className="rounded-full border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600">
              {viewMode === "today" ? "Mark today’s attendance" : "View past records"}
            </div>
          </div>
          <p className="text-sm text-slate-600 mt-1">{selectedDate}</p>
        </div>

        {/* Date Navigation Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateDay(-1)}
            disabled={loading || saving}
            aria-label="Previous day"
          >
            <ChevronLeft size={16} />
          </Button>
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={handleDatePickerChange}
              max={todayStr}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-secondary"
              disabled={loading || saving}
            />
            <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateDay(1)}
            disabled={loading || saving || selectedDate >= todayStr}
            aria-label="Next day"
          >
            <ChevronRight size={16} />
          </Button>
          {selectedDate !== todayStr && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDate(todayStr)}
              disabled={loading}
            >
              Today
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          <div className="bg-emerald-50 text-emerald-900 px-3 py-2 rounded-lg border border-emerald-200">
            Present: {presentCount}
          </div>
          <div className="bg-red-50 text-red-900 px-3 py-2 rounded-lg border border-red-200">
            Absent: {absentCount}
          </div>
          <div className="bg-amber-50 text-amber-900 px-3 py-2 rounded-lg border border-amber-200">
            Leave: {leaveCount}
          </div>
          <div className="bg-slate-50 text-slate-900 px-3 py-2 rounded-lg border border-slate-200">
            Total: {records.length}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => setViewMode("today")}
          disabled={loading || saving}
          variant={viewMode === "today" ? "coaching" : "outline"}
        >
          Mark Attendance
        </Button>
        <Button
          onClick={() => setViewMode("history")}
          disabled={loading || saving}
          variant={viewMode === "history" ? "coaching" : "outline"}
        >
          Attendance History
        </Button>
        {viewMode === "today" ? (
          <>
            <Button
              onClick={handleMarkAllPresent}
              disabled={loading || saving}
              variant="coaching"
            >
              Mark All Present
            </Button>
            <Button
              onClick={handleReset}
              disabled={loading || saving}
              variant="outline"
            >
              Reset All
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading || saving || records.length === 0}
              variant="coaching"
            >
              {saving ? "Saving..." : "Save Attendance"}
            </Button>
          </>
        ) : null}
      </div>

      {message ? (
        <div className={`rounded-lg border px-4 py-3 text-sm ${messageStyles[messageType]}`}>
          {message}
        </div>
      ) : null}

      {viewMode === "history" ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-600">Select student to view attendance history</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <select
                value={selectedHistoryStudentId ?? ""}
                onChange={(e) => setSelectedHistoryStudentId(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                disabled={historyLoading || loading}
              >
                <option value="" disabled>
                  Choose a student
                </option>
                {records.map((record) => (
                  <option key={record.studentId} value={record.studentId}>
                    {record.fullName} ({record.studentCode})
                  </option>
                ))}
              </select>
            </div>
          </div>
          {historyError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
              {historyError}
            </div>
          ) : null}
        </div>
      ) : records.length > 0 ? (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by name or student code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
            disabled={loading || saving}
          />
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left font-semibold text-slate-900 px-4 py-3">Student Name</th>
              <th className="text-left font-semibold text-slate-900 px-4 py-3">Code</th>
              <th className="text-left font-semibold text-slate-900 px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {viewMode === "history" ? (
              historyLoading ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-slate-600">
                    Loading attendance history...
                  </td>
                </tr>
              ) : historyRecords.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-slate-600">
                    {selectedHistoryStudentId ? "No attendance history found." : "Select a student to view history."}
                  </td>
                </tr>
              ) : (
                historyRecords.map((record, index) => (
                  <tr key={`${record.studentId}-${index}`} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{record.fullName}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs font-mono">{record.studentCode}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {record.attendanceDate ?? "Unknown"} — {record.status ?? "absent"}
                    </td>
                  </tr>
                ))
              )
            ) : loading ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-slate-600">
                  Loading attendance records...
                </td>
              </tr>
            ) : filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-slate-600">
                  {searchQuery ? "No matching students found." : "No students found."}
                </td>
              </tr>
            ) : (
              filteredRecords.map((record) => (
                <tr key={record.studentId} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">{record.fullName}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs font-mono">{record.studentCode}</td>
                  <td className="px-4 py-3">
                    <select
                      value={record.status ?? "absent"}
                      onChange={(event) => updateStatus(record.studentId, event.target.value)}
                      disabled={saving}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-secondary focus:border-secondary"
                    >
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="leave">Leave</option>
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