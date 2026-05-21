import { useEffect, useState } from "react";

export type AnalyticsPanelProps = {
  studentId?: string;
  classId?: string;
  section?: string;
  authToken: string;
};

export function AnalyticsPanel({
  studentId,
  classId,
  section,
  authToken,
}: AnalyticsPanelProps) {
  const [studentAnalytics, setStudentAnalytics] = useState<any>(null);
  const [classSummary, setClassSummary] = useState<any>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (studentId) {
      void fetch(`/api/analytics/student/${encodeURIComponent(studentId)}/attendance`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
        .then((response) => response.json())
        .then((payload) => {
          if (payload?.data) {
            setStudentAnalytics(payload.data);
            setMessage(null);
          } else {
            setMessage(payload?.message ?? "Unable to load analytics.");
          }
        })
        .catch(() => setMessage("Unable to load analytics."));
    } else if (classId) {
      const date = new Date().toISOString().slice(0, 10);
      void fetch(
        `/api/analytics/class/${encodeURIComponent(classId)}/summary?date=${encodeURIComponent(
          date,
        )}${section ? `&section=${encodeURIComponent(section)}` : ""}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        },
      )
        .then((response) => response.json())
        .then((payload) => {
          if (payload?.data) {
            setClassSummary(payload.data);
            setMessage(null);
          } else {
            setMessage(payload?.message ?? "Unable to load analytics.");
          }
        })
        .catch(() => setMessage("Unable to load analytics."));
    }
  }, [authToken, studentId, classId, section]);

  return (
    <div>
      <h2>Analytics</h2>
      {message ? <p>{message}</p> : null}
      {studentAnalytics ? (
        <div>
          <p><strong>Overall attendance:</strong> {studentAnalytics.overallPercentage}%</p>
          <p><strong>Current streak:</strong> {studentAnalytics.currentStreak} days</p>
          <p><strong>Warning:</strong> {studentAnalytics.warning ? "Yes" : "No"}</p>
          <div>
            <h3>Monthly attendance</h3>
            <ul>
              {studentAnalytics.monthlyAttendance.map((item: any) => (
                <li key={item.period}>
                  {item.period}: {item.percentage}% ({item.presentDays}/{item.totalDays})
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      {classSummary ? (
        <div>
          <p><strong>Class:</strong> {classSummary.classId}</p>
          <p><strong>Section:</strong> {classSummary.section ?? "All"}</p>
          <p><strong>Date:</strong> {classSummary.date}</p>
          <p><strong>Total students:</strong> {classSummary.totalStudents}</p>
          <p><strong>Present:</strong> {classSummary.presentCount}</p>
          <p><strong>Absent:</strong> {classSummary.absentCount}</p>
          <p><strong>Average attendance:</strong> {classSummary.classAveragePercentage}%</p>
          <p><strong>Warnings:</strong> {classSummary.warningCount}</p>
        </div>
      ) : null}
    </div>
  );
}
