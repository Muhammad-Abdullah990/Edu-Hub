import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@toppers/ui";
import { AttendancePanel, PerformanceNotesPanel } from "@toppers/ui";
import { useAuth } from "@/auth/AuthContext";
import { getTeacherStudents } from "@/lib/backend";

export default function TeacherPortalPage() {
  const auth = useAuth();
  const [view, setView] = useState<"roster" | "attendance" | "performance">("roster");
  const [attendanceClass, setAttendanceClass] = useState("Class 10");
  const [attendanceSection, setAttendanceSection] = useState("A");
  const [performanceStudentId, setPerformanceStudentId] = useState("");

  const studentsQuery = useQuery({
    queryKey: ["teacherStudents"],
    queryFn: getTeacherStudents,
    staleTime: 10000,
  });

  const studentCount = useMemo(
    () => studentsQuery.data?.length ?? 0,
    [studentsQuery.data],
  );

  const classOptions = useMemo(() => {
    const students = studentsQuery.data ?? [];
    return Array.from(new Set(students.map((s) => s.class))).sort();
  }, [studentsQuery.data]);

  const sectionOptions = useMemo(() => {
    const students = (studentsQuery.data ?? []).filter((s) => s.class === attendanceClass);
    return Array.from(new Set(students.map((s) => s.section))).sort();
  }, [studentsQuery.data, attendanceClass]);

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-20">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-[2rem] bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                Teacher Portal
              </p>
              <h1 className="mt-3 text-4xl font-bold text-slate-900">
                Welcome, {auth.user?.name}
              </h1>
              <p className="mt-4 text-slate-600 max-w-2xl">
                Manage your class roster and mark attendance using live API data.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => void auth.logout()}>Logout</Button>
            </div>
          </div>
          <div className="mt-6 flex gap-2">
            <Button
              variant={view === "roster" ? "default" : "outline"}
              onClick={() => setView("roster")}
            >
              Class roster
            </Button>
            <Button
              variant={view === "attendance" ? "default" : "outline"}
              onClick={() => setView("attendance")}
            >
              Attendance
            </Button>
            <Button
              variant={view === "performance" ? "default" : "outline"}
              onClick={() => setView("performance")}
            >
              Performance notes
            </Button>
          </div>
        </section>

        {view === "roster" ? (
          <section className="rounded-[2rem] bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Your Class Roster</h2>
                <p className="text-slate-600">{studentCount} students available for review.</p>
              </div>
              <Button onClick={() => void studentsQuery.refetch()}>Refresh List</Button>
            </div>

            {studentsQuery.isLoading ? (
              <p className="mt-4">Loading students...</p>
            ) : studentsQuery.isError ? (
              <p className="mt-4 text-red-600">Unable to load students.</p>
            ) : studentsQuery.data?.length ? (
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full text-left text-sm text-slate-700">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="py-3 pr-6 font-semibold">Name</th>
                      <th className="py-3 pr-6 font-semibold">Class</th>
                      <th className="py-3 pr-6 font-semibold">Section</th>
                      <th className="py-3 pr-6 font-semibold">Attendance</th>
                      <th className="py-3 pr-6 font-semibold">Fee Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentsQuery.data.map((student) => (
                      <tr key={student.id} className="border-b border-slate-100">
                        <td className="py-4 pr-6 font-medium text-slate-900">{student.fullName}</td>
                        <td className="py-4 pr-6">{student.class}</td>
                        <td className="py-4 pr-6">{student.section}</td>
                        <td className="py-4 pr-6">
                          {student.attendancePercentage != null
                            ? `${student.attendancePercentage}%`
                            : "N/A"}
                        </td>
                        <td className="py-4 pr-6">
                          {student.feeStatus?.status ?? "Unknown"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-4 text-slate-600">No students are available in this view.</p>
            )}
          </section>
        ) : view === "attendance" && auth.accessToken ? (
          <section className="rounded-[2rem] bg-white p-8 shadow-sm space-y-4">
            <div className="flex flex-wrap gap-4">
              <label className="text-sm font-semibold text-slate-700">
                Class
                <select
                  className="ml-2 rounded-xl border border-slate-200 px-3 py-2"
                  value={attendanceClass}
                  onChange={(e) => setAttendanceClass(e.target.value)}
                >
                  {classOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-semibold text-slate-700">
                Section
                <select
                  className="ml-2 rounded-xl border border-slate-200 px-3 py-2"
                  value={attendanceSection}
                  onChange={(e) => setAttendanceSection(e.target.value)}
                >
                  {sectionOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <AttendancePanel
              classId={attendanceClass}
              authToken={auth.accessToken}
            />
          </section>
        ) : view === "performance" && auth.accessToken ? (
          <section className="rounded-[2rem] bg-white p-8 shadow-sm space-y-4">
            <label className="text-sm font-semibold text-slate-700">
              Student
              <select
                className="ml-2 rounded-xl border border-slate-200 px-3 py-2 min-w-[240px]"
                value={performanceStudentId}
                onChange={(e) => setPerformanceStudentId(e.target.value)}
              >
                <option value="">Select student</option>
                {(studentsQuery.data ?? []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName}
                  </option>
                ))}
              </select>
            </label>
            {performanceStudentId ? (
              <PerformanceNotesPanel
                studentId={performanceStudentId}
                authToken={auth.accessToken}
              />
            ) : (
              <p className="text-slate-600">Select a student to add or view performance notes.</p>
            )}
          </section>
        ) : (
          <p className="text-red-600">Sign in required.</p>
        )}
      </div>
    </div>
  );
}
