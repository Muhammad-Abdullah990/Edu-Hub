import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AttendancePanel } from "@toppers/ui";
import {
  createCommunicationQueueItem,
  createUser,
  deleteStudent,
  deleteUser,
  generateReport,
  getAnalyticsSummary,
  getTeacherStudents,
  getParentsForStudent,
  getUpcomingFees,
  linkStudentPortalUser,
  listAuditLogs,
  listCommunicationQueue,
  listNotificationHistory,
  listRoles,
  listUsers,
  reviewCommunicationQueueItem,
  type CommunicationQueueItem,
  type CommunicationChannel,
  type NotificationHistoryItem,
  type PlatformUser,
  type ReviewDecision,
  type StudentCard,
  type UpcomingFee,
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
  const feesQuery = useQuery({ queryKey: ["adminUpcomingFees"], queryFn: getUpcomingFees, enabled: tab === "fees" });
  const commsQuery = useQuery({ queryKey: ["adminComms"], queryFn: listCommunicationQueue, enabled: tab === "communications" });
  const auditQuery = useQuery({ queryKey: ["adminAudit"], queryFn: () => listAuditLogs(100), enabled: tab === "audit" });
  const rolesQuery = useQuery({ queryKey: ["adminRoles"], queryFn: listRoles, enabled: tab === "roles" });
  const analyticsQuery = useQuery({ queryKey: ["adminAnalytics"], queryFn: getAnalyticsSummary, enabled: tab === "analytics" });
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

function getFeeStatusInfo(dueDate: string): { label: string; color: string; urgency: number } {
  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: `Overdue by ${Math.abs(diffDays)} days`, color: "bg-red-100 text-red-800 border-red-200", urgency: 4 };
  if (diffDays === 0) return { label: "Due today", color: "bg-amber-100 text-amber-800 border-amber-200", urgency: 3 };
  if (diffDays <= 3) return { label: `${diffDays} day${diffDays > 1 ? 's' : ''} left`, color: "bg-orange-100 text-orange-800 border-orange-200", urgency: 2 };
  if (diffDays <= 7) return { label: `${diffDays} days left`, color: "bg-yellow-100 text-yellow-800 border-yellow-200", urgency: 1 };
  return { label: `${diffDays} days left`, color: "bg-emerald-100 text-emerald-800 border-emerald-200", urgency: 0 };
}

function FeesTab({ query }: { query: { isLoading: boolean; isError: boolean; data?: UpcomingFee[] } }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const rows = query.data ?? [];

  // Compute summary stats (MUST be before early returns to keep hook order consistent)
  const totalStudents = rows.length;
  const totalDue = rows.reduce((sum, r) => sum + r.amountDue, 0);
  const totalPaid = rows.reduce((sum, r) => sum + r.amountPaid, 0);
  const overdueCount = rows.filter(r => new Date(r.dueDate) < new Date()).length;
  const dueTodayCount = rows.filter(r => {
    const diff = Math.ceil((new Date(r.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff === 0;
  }).length;
  const dueThisWeekCount = rows.filter(r => {
    const diff = Math.ceil((new Date(r.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 7 && diff !== 0;
  }).length;

  // Filter rows - useMemo MUST be before early returns per React Rules of Hooks
  const filtered = useMemo(() => {
    let result = rows;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.studentName.toLowerCase().includes(q) || 
        r.studentCode.toLowerCase().includes(q) ||
        r.class.toLowerCase().includes(q)
      );
    }
    if (statusFilter === "overdue") result = result.filter(r => new Date(r.dueDate) < new Date());
    else if (statusFilter === "due-today") result = result.filter(r => Math.ceil((new Date(r.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) === 0);
    else if (statusFilter === "due-soon") result = result.filter(r => {
      const d = Math.ceil((new Date(r.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return d > 0 && d <= 7;
    });
    else if (statusFilter === "paid") result = result.filter(r => r.status === "paid");
    return result;
  }, [rows, searchQuery, statusFilter]);

  if (query.isLoading) return <div className="flex items-center justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div><p className="ml-3 text-slate-600">Loading fee records...</p></div>;
  if (query.isError) return <div className="rounded-2xl bg-red-50 border border-red-200 p-8 text-center"><p className="text-red-600 font-semibold text-lg">Unable to load fee records.</p><p className="text-red-500 text-sm mt-1">Please check your connection and try again.</p></div>;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <SummaryCard label="Total Students" value={totalStudents} color="blue" />
        <SummaryCard label="Total Due (Rs.)" value={totalDue.toLocaleString()} color="indigo" />
        <SummaryCard label="Total Collected" value={totalPaid.toLocaleString()} color="emerald" />
        <SummaryCard label="Overdue" value={overdueCount} color="red" />
        <SummaryCard label="Due Today" value={dueTodayCount} color="amber" />
        <SummaryCard label="Due This Week" value={dueThisWeekCount} color="orange" />
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search by name, code, or class..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-1">
          {[
            { key: "all", label: "All" },
            { key: "overdue", label: "Overdue" },
            { key: "due-today", label: "Due Today" },
            { key: "due-soon", label: "Due Soon" },
          ].map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setStatusFilter(f.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition ${
                statusFilter === f.key
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-10 text-center">
          <p className="text-slate-500 text-lg">No fee records found.</p>
          {searchQuery && <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filters.</p>}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-slate-500">Student</th>
                <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-slate-500">Code</th>
                <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-slate-500">Class</th>
                <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-slate-500">Description</th>
                <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-slate-500 text-right">Due (Rs.)</th>
                <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-slate-500 text-right">Paid (Rs.)</th>
                <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-slate-500">Status</th>
                <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-slate-500">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((fee) => {
                const statusInfo = getFeeStatusInfo(fee.dueDate);
                const isPaid = fee.status === "paid" || fee.amountPaid >= fee.amountDue;
                return (
                  <tr key={`${fee.studentId}-${fee.dueDate}`} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                    <td className="py-3 px-4 font-medium">{fee.studentName}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-xs">{fee.studentCode}</td>
                    <td className="py-3 px-4 text-slate-500">{fee.class}</td>
                    <td className="py-3 px-4 text-slate-600">{fee.description}</td>
                    <td className="py-3 px-4 text-right font-mono">{fee.amountDue.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-mono">{fee.amountPaid.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      {isPaid ? (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Paid
                        </span>
                      ) : (
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-xs">{fee.dueDate}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-slate-400">
        Showing {filtered.length} of {rows.length} students with upcoming fees
      </p>
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    red: "bg-red-50 border-red-200 text-red-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
    orange: "bg-orange-50 border-orange-200 text-orange-700",
  };
  return (
    <div className={`rounded-xl border p-3 ${colorMap[color] ?? colorMap.blue}`}>
      <p className="text-xs font-semibold opacity-80">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

function CommsTab({ query }: { query: { isLoading: boolean; isError: boolean; data?: CommunicationQueueItem[] } }) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"queue" | "create" | "history">("queue");
  const [selectedItem, setSelectedItem] = useState<CommunicationQueueItem | null>(null);
  const [localMsg, setLocalMsg] = useState<string | null>(null);

  // --- Create form state ---
  const [studentId, setStudentId] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [channel, setChannel] = useState<CommunicationChannel>("in_app");
  const [scheduledAt, setScheduledAt] = useState("");

  // --- Review form state ---
  const [reviewNotes, setReviewNotes] = useState("");

  // --- Notification history query ---
  const historyQuery = useQuery({
    queryKey: ["adminCommsHistory"],
    queryFn: () => listNotificationHistory(),
    enabled: tab === "history",
  });

  // --- Mutations ---
  const createMutation = useMutation({
    mutationFn: () =>
      createCommunicationQueueItem({
        studentId,
        subject,
        message,
        channel,
        scheduledAt: scheduledAt || undefined,
      }),
    onSuccess: () => {
      setLocalMsg("Communication queued successfully! Pending review.");
      setStudentId(""); setSubject(""); setMessage(""); setScheduledAt("");
      void queryClient.invalidateQueries({ queryKey: ["adminComms"] });
      setTab("queue");
    },
    onError: (e) => setLocalMsg(e instanceof Error ? e.message : "Failed to queue communication."),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, decision, notes }: { id: string; decision: ReviewDecision; notes?: string }) =>
      reviewCommunicationQueueItem(id, decision, notes),
    onSuccess: () => {
      setLocalMsg("Review submitted successfully.");
      setSelectedItem(null);
      void queryClient.invalidateQueries({ queryKey: ["adminComms"] });
    },
    onError: (e) => setLocalMsg(e instanceof Error ? e.message : "Review failed."),
  });

  const rows = query.data ?? [];

  if (query.isLoading) return <div className="flex items-center justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div><p className="ml-3 text-slate-600">Loading communication queue...</p></div>;
  if (query.isError) return <div className="rounded-2xl bg-red-50 border border-red-200 p-8 text-center"><p className="text-red-600 font-semibold text-lg">Unable to load communications.</p><p className="text-red-500 text-sm mt-1">Please check your connection and try again.</p></div>;

  return (
    <div className="space-y-6">
      {/* Section tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {(["queue", "create", "history"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { setTab(t); setLocalMsg(null); setSelectedItem(null); }}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition ${tab === t ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-100"}`}
          >
            {t === "queue" ? `Queue (${rows.length})` : t === "create" ? "Send New" : "History"}
          </button>
        ))}
      </div>

      {localMsg ? (
        <p className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-emerald-900 text-sm">{localMsg}</p>
      ) : null}

      {/* --- QUEUE LIST --- */}
      {tab === "queue" && (
        <>
          {rows.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-10 text-center">
              <p className="text-slate-500 text-lg">Queue is empty</p>
              <p className="text-slate-400 text-sm mt-1">Use "Send New" to create a communication.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="min-w-full text-left text-sm text-slate-700">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider">Subject</th>
                    <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider">Channel</th>
                    <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider">Status</th>
                    <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider">Review</th>
                    <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider">Created</th>
                    <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                      <td className="py-3 px-4 font-medium max-w-[200px] truncate">{item.subject}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${channelBadgeColor(item.channel)}`}>
                          {item.channel}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${statusBadgeColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${reviewBadgeColor(item.reviewStatus)}`}>
                          {item.reviewStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}>
                            {selectedItem?.id === item.id ? "Close" : "Detail"}
                          </Button>
                          {item.reviewStatus === "pending" && (
                            <>
                              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => reviewMutation.mutate({ id: item.id, decision: "approved", notes: reviewNotes })}>
                                Approve
                              </Button>
                              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => reviewMutation.mutate({ id: item.id, decision: "rejected", notes: reviewNotes })}>
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Selected item detail */}
          {selectedItem && (
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6 space-y-3">
              <h4 className="font-semibold text-slate-900">{selectedItem.subject}</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div><span className="text-slate-500">Student ID:</span> <span className="font-mono text-xs">{selectedItem.studentId}</span></div>
                <div><span className="text-slate-500">Channel:</span> <span>{selectedItem.channel}</span></div>
                <div><span className="text-slate-500">Status:</span> <span>{selectedItem.status}</span></div>
                <div><span className="text-slate-500">Review:</span> <span>{selectedItem.reviewStatus}</span></div>
                {selectedItem.reviewedBy && <div><span className="text-slate-500">Reviewed by:</span> <span>{selectedItem.reviewedBy}</span></div>}
                {selectedItem.scheduledAt && <div><span className="text-slate-500">Scheduled:</span> <span>{new Date(selectedItem.scheduledAt).toLocaleString()}</span></div>}
              </div>
              <p className="text-sm text-slate-700 bg-white rounded-xl p-3 border border-slate-100 whitespace-pre-wrap">{selectedItem.message}</p>
              {/* Review notes input */}
              {selectedItem.reviewStatus === "pending" && (
                <div className="flex gap-2 items-start">
                  <Input placeholder="Review notes (optional)" value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} />
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* --- CREATE NEW --- */}
      {tab === "create" && (
        <div className="max-w-xl space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Student ID *</label>
            <Input placeholder="Recipient student UUID" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Subject *</label>
            <Input placeholder="e.g. Fee Reminder" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Message *</label>
            <textarea
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm min-h-[100px]"
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Channel</label>
              <select className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" value={channel} onChange={(e) => setChannel(e.target.value as CommunicationChannel)}>
                <option value="in_app">In-App</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Schedule (optional)</label>
              <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
            </div>
          </div>
          <Button disabled={!studentId.trim() || !subject.trim() || !message.trim() || createMutation.isPending} onClick={() => createMutation.mutate()}>
            {createMutation.isPending ? "Queuing..." : "Queue Communication"}
          </Button>
        </div>
      )}

      {/* --- HISTORY --- */}
      {tab === "history" && <NotificationHistoryView query={historyQuery} />}
    </div>
  );
}

function NotificationHistoryView({ query }: { query: { isLoading: boolean; isError: boolean; data?: NotificationHistoryItem[] } }) {
  if (query.isLoading) return <p className="text-slate-600">Loading notification history...</p>;
  if (query.isError) return <p className="text-red-600">Unable to load notification history.</p>;
  const items = query.data ?? [];
  if (items.length === 0) return <p className="text-slate-600">No notifications sent yet.</p>;
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200">
      <table className="min-w-full text-left text-sm text-slate-700">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider">Channel</th>
            <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider">Recipient</th>
            <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider">Status</th>
            <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider">Sent At</th>
            <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider">Response</th>
          </tr>
        </thead>
        <tbody>
          {items.map((h) => (
            <tr key={h.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
              <td className="py-3 px-4">{h.channel}</td>
              <td className="py-3 px-4 text-xs font-mono">{h.recipient}</td>
              <td className="py-3 px-4">
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${statusBadgeColor(h.status)}`}>{h.status}</span>
              </td>
              <td className="py-3 px-4 text-xs text-slate-500">{h.sentAt ? new Date(h.sentAt).toLocaleString() : "-"}</td>
              <td className="py-3 px-4 text-xs max-w-[200px] truncate">{h.response ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function channelBadgeColor(channel: string): string {
  const map: Record<string, string> = {
    email: "bg-blue-100 text-blue-800 border-blue-200",
    sms: "bg-purple-100 text-purple-800 border-purple-200",
    whatsapp: "bg-green-100 text-green-800 border-green-200",
    in_app: "bg-slate-100 text-slate-800 border-slate-200",
  };
  return map[channel] ?? "bg-slate-100 text-slate-800";
}

function statusBadgeColor(status: string): string {
  const map: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    sent: "bg-emerald-100 text-emerald-800 border-emerald-200",
    failed: "bg-red-100 text-red-800 border-red-200",
    drafted: "bg-slate-100 text-slate-800 border-slate-200",
    processing: "bg-blue-100 text-blue-800 border-blue-200",
  };
  return map[status] ?? "bg-slate-100 text-slate-800";
}

function reviewBadgeColor(reviewStatus: string): string {
  const map: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
  };
  return map[reviewStatus] ?? "bg-slate-100 text-slate-800";
}

function UsersTab({ query, onCreated, onMessage }: { query: { isLoading: boolean; isError: boolean; data?: PlatformUser[] }; onCreated: () => void; onMessage: (msg: string | null) => void }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", roleName: "TEACHER", studentCode: "", class: "", monthlyFeeAmount: 0, feeCycleStartDate: "", parentWhatsapp1: "", parentWhatsapp2: "", parentWhatsapp3: "" });
  const [msg, setMsg] = useState<string | null>(null);
  const createMutation = useMutation({
    mutationFn: () => {
      const parentWhatsappNumbers: string[] = [];
      if (form.parentWhatsapp1.trim()) parentWhatsappNumbers.push(form.parentWhatsapp1.trim());
      if (form.parentWhatsapp2.trim()) parentWhatsappNumbers.push(form.parentWhatsapp2.trim());
      if (form.parentWhatsapp3.trim()) parentWhatsappNumbers.push(form.parentWhatsapp3.trim());
      return createUser({ 
        name: form.name, 
        email: form.email, 
        password: form.password, 
        roleName: form.roleName,
        studentCode: form.studentCode || undefined,
        class: form.class || undefined,
        section: "A",
        monthlyFeeAmount: form.monthlyFeeAmount || undefined,
        feeCycleStartDate: form.feeCycleStartDate || undefined,
        parentWhatsappNumbers: parentWhatsappNumbers.length > 0 ? parentWhatsappNumbers : undefined,
      });
    },
    onSuccess: () => {
      setMsg(`User created successfully! Role: ${form.roleName}`);
      setForm({ name: "", email: "", password: "", roleName: "TEACHER", studentCode: "", class: "", monthlyFeeAmount: 0, feeCycleStartDate: "", parentWhatsapp1: "", parentWhatsapp2: "", parentWhatsapp3: "" });
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
            <div className="col-span-2 border-t border-slate-200 pt-2 mt-1">
              <p className="text-sm font-semibold text-slate-700 mb-2">Parent WhatsApp Numbers (for fee reminders & reports)</p>
            </div>
            <Input placeholder="Parent 1 WhatsApp (e.g. +923001234567)" value={form.parentWhatsapp1} onChange={(e) => setForm({ ...form, parentWhatsapp1: e.target.value })} />
            <Input placeholder="Parent 2 WhatsApp (optional)" value={form.parentWhatsapp2} onChange={(e) => setForm({ ...form, parentWhatsapp2: e.target.value })} />
            <Input placeholder="Guardian WhatsApp (optional)" value={form.parentWhatsapp3} onChange={(e) => setForm({ ...form, parentWhatsapp3: e.target.value })} />
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
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const filtered = useMemo(() => {
    if (!searchQuery) return students;
    const q = searchQuery.toLowerCase();
    return students.filter((s) => s.fullName.toLowerCase().includes(q) || s.class.toLowerCase().includes(q));
  }, [students, searchQuery]);

  const deleteMutation = useMutation({
    mutationFn: (studentId: string) => deleteStudent(studentId),
    onSuccess: () => {
      setDeletingId(null);
      void queryClient.invalidateQueries({ queryKey: ["adminErpStudents"] });
    },
    onError: (e) => {
      setDeletingId(null);
      alert(`Delete failed: ${e instanceof Error ? e.message : "Unknown error"}`);
    },
  });

  const confirmDelete = (studentId: string, studentName: string) => {
    if (window.confirm(`⚠️ PERMANENTLY DELETE "${studentName}"?\n\nThis will erase them from:\n- Students section\n- Attendance records\n- Fee records\n- Performance notes\n- Communication history\n- Linked portal user account\n\nThis CANNOT be undone!`)) {
      setDeletingId(studentId);
      deleteMutation.mutate(studentId);
    }
  };

  if (loading) return <p className="text-slate-600 animate-pulse">Loading students...</p>;
  if (!students.length) return <p className="text-amber-600 bg-amber-50 px-4 py-3 rounded-xl border border-amber-200">No students found. Students created via Users tab should appear here. If none exist, create a user with role STUDENT.</p>;
  return (
    <div className="space-y-4">
      <Input placeholder="Search students..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      <p className="text-sm text-slate-600">Showing {filtered.length} of {students.length} students.</p>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-700">
          <thead><tr className="border-b border-slate-200"><th className="py-3 pr-6 font-semibold">Name</th><th className="py-3 pr-6 font-semibold">Class</th><th className="py-3 pr-6 font-semibold">Portal</th><th className="py-3 pr-6 font-semibold">Actions</th></tr></thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-b border-slate-100">
                <td className="py-3 pr-6">{s.fullName}</td>
                <td className="py-3 pr-6">{s.class}</td>
                <td className="py-3 pr-6">{s.portalUserId ? "Yes" : "No"}</td>
                <td className="py-3 pr-6 flex gap-2">
                  <Button size="sm" variant="outline" disabled={linking} onClick={() => onLink(s.id)}>Link</Button>
                  <Button
                    size="sm"
                    disabled={deletingId === s.id}
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => confirmDelete(s.id, s.fullName)}
                  >
                    {deletingId === s.id ? "Deleting..." : "Delete"}
                  </Button>
                </td>
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

interface AnalyticsSummary {
  timestamp: string;
  studentStats: { totalStudents: number; activeClasses: string[]; classCount: number };
  staffStats: { totalTeachers: number; totalParents: number; parentLinks: number };
  attendanceStats: { overallAverage: number; lowAttendanceCount: number; todayPresent: number; todayAbsent: number };
  feeStats: { totalDue: number; totalCollected: number; pendingFees: number; overdueFees: number; collectionRate: number };
  performanceStats: { recentNotes: number };
  classDistribution: Array<{ className: string; studentCount: number }>;
}

function AnalyticsTab({ query }: { query: { isLoading: boolean; isError: boolean; data?: AnalyticsSummary } }) {
  if (query.isLoading) return <div className="flex items-center justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div><p className="ml-3 text-slate-600">Loading analytics...</p></div>;
  if (query.isError) return <div className="rounded-2xl bg-red-50 border border-red-200 p-8 text-center"><p className="text-red-600 font-semibold text-lg">Unable to load analytics.</p><p className="text-red-500 text-sm mt-1">Please check your connection and try again.</p></div>;

  const d = query.data;
  if (!d) return <p className="text-slate-600">No analytics data available.</p>;

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600">Comprehensive dashboard overview across all students, fees, attendance, and classes.</p>

      {/* Student Stats */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-3">Students Overview</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total Students" value={d.studentStats.totalStudents} color="blue" />
          <StatCard label="Active Classes" value={d.studentStats.classCount} color="indigo" />
          <StatCard label="Total Teachers" value={d.staffStats.totalTeachers} color="violet" />
          <StatCard label="Total Parents" value={d.staffStats.totalParents} color="slate" />
        </div>
      </div>

      {/* Attendance Stats */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-3">Attendance Overview</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Overall Avg" value={`${d.attendanceStats.overallAverage}%`} color="emerald" />
          <StatCard label="Low Attendance (<75%)" value={d.attendanceStats.lowAttendanceCount} color="red" />
          <StatCard label="Today Present" value={d.attendanceStats.todayPresent} color="green" />
          <StatCard label="Today Absent" value={d.attendanceStats.todayAbsent} color="orange" />
        </div>
      </div>

      {/* Fee Stats */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-3">Fee Overview</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <StatCard label="Total Due (Rs.)" value={d.feeStats.totalDue.toLocaleString()} color="amber" />
          <StatCard label="Collected (Rs.)" value={d.feeStats.totalCollected.toLocaleString()} color="emerald" />
          <StatCard label="Collection Rate" value={`${d.feeStats.collectionRate}%`} color="blue" />
          <StatCard label="Pending Fees" value={d.feeStats.pendingFees} color="orange" />
          <StatCard label="Overdue" value={d.feeStats.overdueFees} color="red" />
        </div>
      </div>

      {/* Class Distribution */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-3">Class Distribution</h3>
        {d.classDistribution.length === 0 ? (
          <p className="text-slate-500 text-sm">No class data available.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full text-left text-sm text-slate-700">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-slate-500">Class</th>
                  <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-slate-500 text-right">Students</th>
                </tr>
              </thead>
              <tbody>
                {d.classDistribution.map((c) => (
                  <tr key={c.className} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-medium">{c.className}</td>
                    <td className="py-3 px-4 text-right">{c.studentCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Performance */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-3">Performance</h3>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Recent Notes (30 days)" value={d.performanceStats.recentNotes} color="violet" />
        </div>
      </div>

      <p className="text-xs text-slate-400">Last updated: {new Date(d.timestamp).toLocaleString()}</p>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 border-blue-200",
    indigo: "bg-indigo-50 border-indigo-200",
    emerald: "bg-emerald-50 border-emerald-200",
    red: "bg-red-50 border-red-200",
    amber: "bg-amber-50 border-amber-200",
    orange: "bg-orange-50 border-orange-200",
    violet: "bg-violet-50 border-violet-200",
    slate: "bg-slate-50 border-slate-200",
    green: "bg-green-50 border-green-200",
  };
  const textColorMap: Record<string, string> = {
    blue: "text-blue-700",
    indigo: "text-indigo-700",
    emerald: "text-emerald-700",
    red: "text-red-700",
    amber: "text-amber-700",
    orange: "text-orange-700",
    violet: "text-violet-700",
    slate: "text-slate-700",
    green: "text-green-700",
  };
  return (
    <div className={`rounded-xl border p-3 ${colorMap[color] ?? colorMap.blue}`}>
      <p className={`text-xs font-semibold opacity-80 ${textColorMap[color] ?? textColorMap.blue}`}>{label}</p>
      <p className={`text-2xl font-bold mt-1 ${textColorMap[color] ?? textColorMap.blue}`}>{value}</p>
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