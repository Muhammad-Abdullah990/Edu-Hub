import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AttendancePanel } from "@toppers/ui";
import {
  createUser,
  generateReport,
  getTeacherStudents,
  getParentsForStudent,
  linkStudentPortalUser,
  listAuditLogs,
  listCommunicationQueue,
  listFeeRecords,
  listRoles,
  listUsers,
  type FeeRecord,
  type PlatformUser,
  type StudentCard,
} from "@/lib/backend";
import { useAuth } from "@/auth/AuthContext";
import { Button, Input } from "@toppers/ui";

type AdminTabId =
  | "attendance" | "fees" | "communications" | "users" | "students"
  | "reports" | "parents" | "audit" | "roles" | "analytics";

const TAB_LABELS: Record<AdminTabId, string> = {
  attendance: "Attendance", fees: "Fees", communications: "Comms",
  users: "Users", students: "Students", reports: "Reports",
  parents: "Parents", audit: "Audit", roles: "Roles", analytics: "Analytics",
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const accessToken = localStorage.getItem("accessToken");
  const headers = new Headers(init.headers ?? {});
  if (accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(`${API_BASE_URL}${path}`, { credentials: "include", ...init, headers });
  if (!response.ok) {
    const text = await response.text();
    try {
      const parsed = JSON.parse(text);
      throw new Error(`Request failed: ${response.status} ${response.statusText} - ${parsed?.message || parsed?.error?.message || JSON.stringify(parsed)}`);
    } catch {
      throw new Error(`Request failed: ${response.status} ${response.statusText} - ${text || response.statusText}`);
    }
  }
  if (response.status === 204) return {} as T;
  if ((response.headers.get("content-type") ?? "").includes("application/json")) {
    return (await response.json()) as T;
  }
  return (await response.text()) as unknown as T;
}

export function AdminErpTabs() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<AdminTabId>("attendance");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [linkUserId, setLinkUserId] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const studentsQuery = useQuery({ queryKey: ["adminErpStudents"], queryFn: getTeacherStudents, staleTime: 10000 });
  const usersQuery = useQuery({ queryKey: ["adminUsers"], queryFn: () => listUsers(), enabled: tab === "users" });
  const feesQuery = useQuery({ queryKey: ["adminFees"], queryFn: () => listFeeRecords(), enabled: tab === "fees" });
  const commsQuery = useQuery({ queryKey: ["adminComms"], queryFn: listCommunicationQueue, enabled: tab === "communications" });
  const auditQuery = useQuery({ queryKey: ["adminAudit"], queryFn: () => listAuditLogs(100), enabled: tab === "audit" });
  const rolesQuery = useQuery({ queryKey: ["adminRoles"], queryFn: listRoles, enabled: tab === "roles" });
  const analyticsQuery = useQuery({ queryKey: ["adminAnalytics"], queryFn: () => apiFetch("/analytics/summary"), enabled: tab === "analytics" });
  const parentsQuery = useQuery({
    queryKey: ["adminParents", selectedStudentId],
    queryFn: () => getParentsForStudent(selectedStudentId),
    enabled: tab === "parents" && Boolean(selectedStudentId),
  });

  const allStudents = studentsQuery.data ?? [];

  const linkMutation = useMutation({
    mutationFn: ({ studentId, portalUserId }: { studentId: string; portalUserId: string | null }) =>
      linkStudentPortalUser(studentId, portalUserId),
    onSuccess: () => {
      setMessage("Portal user link updated.");
      void queryClient.invalidateQueries({ queryKey: ["adminErpStudents"] });
    },
    onError: (e) => setMessage(e instanceof Error ? e.message : "Link failed."),
  });

  if (!auth.accessToken) {
    return <p className="text-red-600">Authentication token unavailable.</p>;
  }

  return (
    <section className="rounded-[2rem] bg-white p-8 shadow-sm space-y-6">
      <h2 className="text-2xl font-semibold text-slate-900">Coaching Operations</h2>
      {message ? (
        <p className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-emerald-900 text-sm">{message}</p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(TAB_LABELS) as AdminTabId[]).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => { setTab(id); setMessage(null); }}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === id ? "bg-primary text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
          >
            {TAB_LABELS[id]}
          </button>
        ))}
      </div>

      {tab === "attendance" && (
        <AttendancePanel authToken={auth.accessToken} />
      )}

      {tab === "fees" && <FeesTab query={feesQuery} />}
      {tab === "communications" && <CommsTab query={commsQuery} />}
      {tab === "users" && <UsersTab query={usersQuery} onCreated={() => { void queryClient.invalidateQueries({ queryKey: ["adminUsers"] }); void queryClient.invalidateQueries({ queryKey: ["adminErpStudents"] }); }} onMessage={setMessage} />}
      {tab === "students" && (
        <StudentsTab
          students={allStudents}
          loading={studentsQuery.isLoading}
          linkUserId={linkUserId}
          onLinkUserIdChange={setLinkUserId}
          onLink={(studentId) => linkMutation.mutate({ studentId, portalUserId: linkUserId.trim() || null })}
          linking={linkMutation.isPending}
        />
      )}
      {tab === "reports" && <ReportsTab students={allStudents} onMessage={setMessage} />}
      {tab === "parents" && <ParentsTab students={allStudents} selectedStudentId={selectedStudentId} onSelectStudent={setSelectedStudentId} query={parentsQuery} />}
      {tab === "audit" && <AuditTab query={auditQuery} />}
      {tab === "roles" && <RolesTab query={rolesQuery} />}
      {tab === "analytics" && <AnalyticsTab query={analyticsQuery} />}
    </section>
  );
}

function FeesTab({ query }: { query: { isLoading: boolean; isError: boolean; data?: FeeRecord[] } }) {
  if (query.isLoading) return <p>Loading fee records...</p>;
  if (query.isError) return <p className="text-red-600">Unable to load fee records.</p>;
  const rows = query.data ?? [];
  if (!rows.length) return <p className="text-slate-600">No fee records found.</p>;
  return (<DataTable headers={["Student ID", "Description", "Due (Rs.)", "Paid (Rs.)", "Status"]} rows={rows.map((r) => [r.studentId.slice(0, 8) + "...", r.description, String(r.amountDue), String(r.amountPaid), r.status])} />);
}

function CommsTab({ query }: { query: { isLoading: boolean; isError: boolean; data?: Array<{ studentId: string; channel: string; status: string; reviewStatus: string }> } }) {
  if (query.isLoading) return <p>Loading communication queue...</p>;
  if (query.isError) return <p className="text-red-600">Unable to load communication queue.</p>;
  const rows = query.data ?? [];
  if (!rows.length) return <p className="text-slate-600">Queue is empty.</p>;
  return (<DataTable headers={["Student ID", "Channel", "Status", "Review"]} rows={rows.map((r) => [r.studentId.slice(0, 8) + "...", r.channel, r.status, r.reviewStatus])} />);
}

function UsersTab({ query, onCreated, onMessage }: { query: { isLoading: boolean; isError: boolean; data?: PlatformUser[] }; onCreated: () => void; onMessage: (msg: string | null) => void }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", roleName: "TEACHER", studentCode: "", class: "", monthlyFeeAmount: 0, feeCycleStartDate: "" });
  const [msg, setMsg] = useState<string | null>(null);
  const createMutation = useMutation({
    mutationFn: () => createUser({ 
      name: form.name, 
      email: form.email, 
      password: form.password, 
      roleName: form.roleName,
      studentCode: form.studentCode || undefined,
      class: form.class || undefined,
      section: "A",
      monthlyFeeAmount: form.monthlyFeeAmount || undefined,
      feeCycleStartDate: form.feeCycleStartDate || undefined,
    }),
    onSuccess: () => {
      setMsg(`User created successfully! Role: ${form.roleName}`);
      setForm({ name: "", email: "", password: "", roleName: "TEACHER", studentCode: "", class: "", monthlyFeeAmount: 0, feeCycleStartDate: "" });
      onCreated();
    },
    onError: (e) => setMsg(e instanceof Error ? e.message : "Create failed."),
  });
  const isStudent = form.roleName === "STUDENT";
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <Input placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <select className="rounded-xl border border-slate-200 px-3 py-2" value={form.roleName} onChange={(e) => setForm({ ...form, roleName: e.target.value })}>
          {["SUPER_ADMIN", "ADMIN", "TEACHER", "STUDENT", "PARENT"].map((r) => (<option key={r} value={r}>{r}</option>))}
        </select>
        {isStudent && (
          <>
            <Input placeholder="Student Code (e.g. STU-001)" value={form.studentCode} onChange={(e) => setForm({ ...form, studentCode: e.target.value })} />
            <Input placeholder="Class (e.g. Class 10)" value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })} />
            <Input placeholder="Fee Amount (Rs.)" type="number" value={form.monthlyFeeAmount || ""} onChange={(e) => setForm({ ...form, monthlyFeeAmount: Number(e.target.value) })} />
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-semibold">Fee Cycle Start Date</label>
              <Input type="date" value={form.feeCycleStartDate} onChange={(e) => setForm({ ...form, feeCycleStartDate: e.target.value })} />
            </div>
          </>
        )}
      </div>
      <div className="flex gap-2 items-center">
        <Button disabled={createMutation.isPending} onClick={() => createMutation.mutate()}>
          {createMutation.isPending ? "Creating..." : `Create ${form.roleName}`}
        </Button>
        {msg ? <p className="text-sm text-slate-600">{msg}</p> : null}
      </div>
      {query.isLoading ? <p>Loading users...</p> : query.isError ? <p className="text-red-600">Unable to load users.</p> : (
        <DataTable headers={["Name", "Email", "Role", "Status"]} rows={(query.data ?? []).map((u) => [u.name, u.email, u.primaryRole.name, u.status])} />
      )}
    </div>
  );
}

function StudentsTab({ students, loading, linkUserId, onLinkUserIdChange, onLink, linking }: { students: StudentCard[]; loading: boolean; linkUserId: string; onLinkUserIdChange: (v: string) => void; onLink: (studentId: string) => void; linking: boolean }) {
  const [searchQuery, setSearchQuery] = useState("");
  const filtered = useMemo(() => {
    if (!searchQuery) return students;
    const q = searchQuery.toLowerCase();
    return students.filter((s) => s.fullName.toLowerCase().includes(q) || s.class.toLowerCase().includes(q));
  }, [students, searchQuery]);
  if (loading) return <p className="text-slate-600 animate-pulse">Loading students...</p>;
  if (!students.length) return <p className="text-amber-600 bg-amber-50 px-4 py-3 rounded-xl border border-amber-200">No students found. Students created via Users tab should appear here. If none exist, create a user with role STUDENT.</p>;
  return (
    <div className="space-y-4">
      <Input placeholder="Search students..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      <p className="text-sm text-slate-600">Showing {filtered.length} of {students.length} students.</p>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-700">
          <thead><tr className="border-b border-slate-200"><th className="py-3 pr-6 font-semibold">Name</th><th className="py-3 pr-6 font-semibold">Class</th><th className="py-3 pr-6 font-semibold">Portal</th><th className="py-3 pr-6 font-semibold">Action</th></tr></thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-b border-slate-100">
                <td className="py-3 pr-6">{s.fullName}</td>
                <td className="py-3 pr-6">{s.class}</td>
                <td className="py-3 pr-6">{s.portalUserId ? "Yes" : "No"}</td>
                <td className="py-3 pr-6"><Button size="sm" variant="outline" disabled={linking} onClick={() => onLink(s.id)}>Link</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-slate-700">Link Portal User</label>
        <div className="flex gap-2">
          <Input placeholder="Portal user UUID" value={linkUserId} onChange={(e) => onLinkUserIdChange(e.target.value)} />
          <Button size="sm" variant="outline" disabled={linking || !linkUserId.trim()} onClick={() => onLink(filtered[0]?.id)}>Link Selected</Button>
        </div>
      </div>
    </div>
  );
}

function ReportsTab({ students, onMessage }: { students: StudentCard[]; onMessage: (msg: string) => void }) {
  const [studentId, setStudentId] = useState("");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [teacherNote, setTeacherNote] = useState("Monthly progress summary.");
  const [searchQuery, setSearchQuery] = useState("");
  const filtered = useMemo(() => {
    if (!searchQuery) return students;
    const q = searchQuery.toLowerCase();
    return students.filter((s) => s.fullName.toLowerCase().includes(q) || s.class.toLowerCase().includes(q) || s.id.toLowerCase().includes(q));
  }, [students, searchQuery]);
  const mutation = useMutation({
    mutationFn: () => generateReport({ studentId, month, teacherNote, strengths: ["Consistent effort", "Good participation"], weaknesses: ["Needs more practice tests"] }),
    onSuccess: (data) => onMessage(`Report queued successfully! ID: ${data?.reportId ?? data?.jobId ?? "pending"}`),
    onError: (e) => onMessage(`Report queue failed: ${e instanceof Error ? e.message : "Unknown error"}`),
  });
  return (
    <div className="space-y-4 max-w-xl">
      <div><label className="block text-sm font-semibold text-slate-700 mb-1">Search Student</label><Input placeholder="Type to search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
      <div><label className="block text-sm font-semibold text-slate-700 mb-1">Select Student ({filtered.length} available)</label>
        <select className="w-full rounded-xl border border-slate-200 px-3 py-2" value={studentId} onChange={(e) => setStudentId(e.target.value)} size={Math.min(filtered.length + 1, 6)}>
          <option value="">-- Select a student --</option>
          {filtered.map((s) => (<option key={s.id} value={s.id}>{s.fullName} ({s.class})</option>))}
        </select>
      </div>
      <div><label className="block text-sm font-semibold text-slate-700 mb-1">Month (YYYY-MM)</label><Input value={month} onChange={(e) => setMonth(e.target.value)} /></div>
      <div><label className="block text-sm font-semibold text-slate-700 mb-1">Teacher Note</label><textarea className="w-full rounded-xl border border-slate-200 px-3 py-2" rows={3} value={teacherNote} onChange={(e) => setTeacherNote(e.target.value)} /></div>
      <Button disabled={!studentId || mutation.isPending} onClick={() => mutation.mutate()}>
        {mutation.isPending ? "Queuing..." : "Queue Report Generation"}
      </Button>
    </div>
  );
}

function ParentsTab({ students, selectedStudentId, onSelectStudent, query }: { students: StudentCard[]; selectedStudentId: string; onSelectStudent: (id: string) => void; query: { isLoading: boolean; isError: boolean; data?: Array<{ name: string; phone: string | null; relationship: string }> } }) {
  return (
    <div className="space-y-4">
      <select className="rounded-xl border border-slate-200 px-3 py-2" value={selectedStudentId} onChange={(e) => onSelectStudent(e.target.value)}>
        <option value="">Select student</option>
        {students.map((s) => (<option key={s.id} value={s.id}>{s.fullName}</option>))}
      </select>
      {query.isLoading ? <p>Loading parents...</p> : query.isError ? <p className="text-red-600">Unable to load parents.</p> : !selectedStudentId ? <p className="text-slate-600">Select a student to view parents.</p> : (query.data ?? []).length === 0 ? <p className="text-slate-600">No parents linked.</p> : (<DataTable headers={["Name", "Phone", "Relationship"]} rows={(query.data ?? []).map((p) => [p.name, p.phone ?? "-", p.relationship])} />)}
    </div>
  );
}

function AuditTab({ query }: { query: { isLoading: boolean; isError: boolean; data?: Array<{ action: string; entityType: string; userName: string | null; createdAt: string }> } }) {
  if (query.isLoading) return <p>Loading audit logs...</p>;
  if (query.isError) return <p className="text-red-600">Unable to load audit logs.</p>;
  const rows = query.data ?? [];
  if (!rows.length) return <p className="text-slate-600">No audit entries yet.</p>;
  return <DataTable headers={["Action", "Entity", "User", "When"]} rows={rows.map((r) => [r.action, r.entityType, r.userName ?? "system", new Date(r.createdAt).toLocaleString()])} />;
}

function RolesTab({ query }: { query: { isLoading: boolean; isError: boolean; data?: Array<{ name: string; description: string }> } }) {
  if (query.isLoading) return <p>Loading roles...</p>;
  if (query.isError) return <p className="text-red-600">Unable to load roles.</p>;
  return <DataTable headers={["Role", "Description"]} rows={(query.data ?? []).map((r) => [r.name, r.description])} />;
}

function AnalyticsTab({ query }: { query: { isLoading: boolean; isError: boolean; data: unknown } }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">Complete analytics overview across all students and classes.</p>
      {query.isLoading ? <p>Loading analytics...</p> : query.isError ? <p className="text-red-600">Unable to load analytics.</p> : (
        <pre className="rounded-2xl bg-slate-50 p-4 text-xs overflow-auto max-h-96">{JSON.stringify(query.data, null, 2)}</pre>
      )}
    </div>
  );
}

function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm text-slate-700">
        <thead><tr className="border-b border-slate-200">{headers.map((h) => (<th key={h} className="py-3 pr-6 font-semibold">{h}</th>))}</tr></thead>
        <tbody>{rows.map((row, i) => (<tr key={i} className="border-b border-slate-100">{row.map((cell, j) => (<td key={j} className="py-3 pr-6">{cell}</td>))}</tr>))}</tbody>
      </table>
    </div>
  );
}