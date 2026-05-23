import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@toppers/ui";
import { useAuth } from "@/auth/AuthContext";
import {
  getMyStudentProfile,
  getStudentProfile,
  getStudentReports,
  downloadReport,
  listMySessions,
  revokeSession,
} from "@/lib/backend";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function StudentPortalPage() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const [manualIdInput, setManualIdInput] = useState("");
  const [useManualLookup, setUseManualLookup] = useState(false);

  const linkedQuery = useQuery({
    queryKey: ["myStudentProfile"],
    queryFn: getMyStudentProfile,
    enabled: auth.status === "authenticated" && !useManualLookup,
    retry: false,
  });

  const manualStudentId = useMemo(
    () => (useManualLookup ? manualIdInput.trim() || null : null),
    [useManualLookup, manualIdInput],
  );

  const manualProfileQuery = useQuery({
    queryKey: ["studentProfile", manualStudentId],
    queryFn: () => getStudentProfile(manualStudentId as string),
    enabled: Boolean(manualStudentId),
    retry: false,
  });

  const profile = useManualLookup ? manualProfileQuery.data : linkedQuery.data;
  const profileQuery = useManualLookup ? manualProfileQuery : linkedQuery;
  const studentId = profile?.id ?? null;

  const sessionsQuery = useQuery({
    queryKey: ["mySessions"],
    queryFn: listMySessions,
    enabled: auth.status === "authenticated",
  });

  const revokeMutation = useMutation({
    mutationFn: revokeSession,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["mySessions"] }),
  });

  const reportsQuery = useQuery({
    queryKey: ["studentReports", studentId],
    queryFn: () => getStudentReports(studentId as string),
    enabled: Boolean(studentId),
    retry: false,
  });

  const handleDownload = async (reportId: string) => {
    try {
      await downloadReport(reportId);
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Unable to download report.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-20">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-[2rem] bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                Student Portal
              </p>
              <h1 className="mt-3 text-4xl font-bold text-slate-900">
                Welcome, {auth.user?.name}
              </h1>
              <p className="mt-4 text-slate-600 max-w-2xl">
                Your profile loads automatically when your login is linked to a
                student record. Admins can use manual lookup for support.
              </p>
            </div>
            <Button onClick={() => void auth.logout()}>Logout</Button>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.6fr_1.4fr]">
          <div className="rounded-[2rem] bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Profile access</h2>
            {!useManualLookup && linkedQuery.isError ? (
              <p className="text-amber-700 text-sm mb-4">
                No student profile is linked to this account. Ask an administrator to
                link your user, or use manual lookup.
              </p>
            ) : null}
            <label className="flex items-center gap-2 text-sm text-slate-700 mb-4">
              <input
                type="checkbox"
                checked={useManualLookup}
                onChange={(e) => setUseManualLookup(e.target.checked)}
              />
              Manual student UUID lookup (admin support)
            </label>
            {useManualLookup ? (
              <>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Student ID
                </label>
                <input
                  className="w-full rounded-3xl border border-slate-200 px-4 py-3 text-slate-800"
                  placeholder="Enter student UUID"
                  value={manualIdInput}
                  onChange={(e) => setManualIdInput(e.target.value)}
                />
              </>
            ) : null}
          </div>

          <div className="rounded-[2rem] bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Student Summary</h2>
            {profileQuery.isLoading ? (
              <p>Loading student profile...</p>
            ) : profileQuery.isError ? (
              <p className="text-red-600">Unable to load student profile.</p>
            ) : profile ? (
              <div className="space-y-4 text-slate-700">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Full Name</p>
                  <p className="font-semibold text-slate-900">{profile.fullName}</p>
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Class</p>
                  <p>{profile.class}</p>
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Section</p>
                  <p>{profile.section}</p>
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Attendance</p>
                  <p>{profile.attendancePercentage ?? 0}%</p>
                </div>
                {profile.feeStatus ? (
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Fee Status</p>
                    <p>{profile.feeStatus.status}</p>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-slate-600">Profile not available.</p>
            )}
          </div>
        </section>

        <section className="rounded-[2rem] bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Active sessions</h2>
          {sessionsQuery.isLoading ? (
            <p>Loading sessions...</p>
          ) : sessionsQuery.data && sessionsQuery.data.length > 0 ? (
            <ul className="space-y-3">
              {sessionsQuery.data.map((session) => (
                <li
                  key={session.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4"
                >
                  <div className="text-sm text-slate-700">
                    <p>{session.deviceInfo ?? "Unknown device"}</p>
                    <p className="text-slate-500">
                      Expires {new Date(session.expiresAt).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={revokeMutation.isPending}
                    onClick={() => revokeMutation.mutate(session.id)}
                  >
                    Revoke
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-600">No other active sessions.</p>
          )}
        </section>

        <section className="rounded-[2rem] bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Report History</h2>
          {reportsQuery.isLoading ? (
            <p>Loading reports...</p>
          ) : reportsQuery.isError ? (
            <p className="text-red-600">Unable to load reports.</p>
          ) : reportsQuery.data && reportsQuery.data.length > 0 ? (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-700">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-3 pr-6 font-semibold">Month</th>
                    <th className="py-3 pr-6 font-semibold">Status</th>
                    <th className="py-3 pr-6 font-semibold">Created</th>
                    <th className="py-3 pr-6 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reportsQuery.data.map((report) => (
                    <tr key={report.id} className="border-b border-slate-100">
                      <td className="py-4 pr-6">{report.month}</td>
                      <td className="py-4 pr-6">{report.status}</td>
                      <td className="py-4 pr-6">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 pr-6">
                        <Button size="sm" onClick={() => void handleDownload(report.id)}>
                          Download
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-600">No reports available yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}
