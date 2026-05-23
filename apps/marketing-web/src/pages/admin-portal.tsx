import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@toppers/ui";
import { useAuth } from "@/auth/AuthContext";
import {
  getAdminDashboard,
  getPendingWorkflows,
  getSystemInfo,
  approveWorkflow,
  rejectWorkflow,
} from "@/lib/backend";
import { AdminErpTabs } from "@/components/erp/AdminErpTabs";

export default function AdminPortalPage() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const [operationMessage, setOperationMessage] = useState<string | null>(null);

  const dashboardQuery = useQuery({
    queryKey: ["adminDashboard"],
    queryFn: getAdminDashboard,
    staleTime: 10000,
  });

  const workflowsQuery = useQuery({
    queryKey: ["pendingWorkflows"],
    queryFn: getPendingWorkflows,
    staleTime: 5000,
  });

  const systemInfoQuery = useQuery({
    queryKey: ["systemInfo"],
    queryFn: getSystemInfo,
    staleTime: 30000,
  });

  const workflows = workflowsQuery.data?.workflows ?? [];

  const approveMutation = useMutation({
    mutationFn: ({ workflowId, approvedBy }: { workflowId: string; approvedBy: string }) =>
      approveWorkflow(workflowId, approvedBy),
    onSuccess: () => {
      setOperationMessage("Workflow approved and sent successfully.");
      queryClient.invalidateQueries({ queryKey: ["pendingWorkflows"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
    },
    onError: (error) => {
      setOperationMessage(
        error instanceof Error ? error.message : "Unable to approve workflow.",
      );
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ workflowId, reason }: { workflowId: string; reason: string }) =>
      rejectWorkflow(workflowId, reason),
    onSuccess: () => {
      setOperationMessage("Workflow rejected successfully.");
      queryClient.invalidateQueries({ queryKey: ["pendingWorkflows"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
    },
    onError: (error) => {
      setOperationMessage(
        error instanceof Error ? error.message : "Unable to reject workflow.",
      );
    },
  });

  const handleApprove = (workflowId: string) => {
    approveMutation.mutate({ workflowId, approvedBy: auth.user?.name ?? "Administrator" });
  };

  const handleReject = async (workflowId: string) => {
    const reason = window.prompt("Enter rejection reason for this workflow:");
    if (!reason) {
      return;
    }
    rejectMutation.mutate({ workflowId, reason });
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-20">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-[2rem] bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                Operational Admin Portal
              </p>
              <h1 className="mt-3 text-4xl font-bold text-slate-900">
                Welcome back, {auth.user?.name}
              </h1>
              <p className="mt-4 text-slate-600 max-w-2xl">
                This portal now connects directly to the API layer for dashboard
                health, workflow approvals, and live system information.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => void auth.logout()}>Logout</Button>
              <Button variant="outline" onClick={() => void auth.logoutAll()}>
                Logout All Sessions
              </Button>
            </div>
          </div>
        </section>

        {operationMessage ? (
          <div className="rounded-3xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-900">
            {operationMessage}
          </div>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="rounded-[2rem] bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">System Health Summary</h2>
            {dashboardQuery.isLoading ? (
              <p>Loading dashboard metrics...</p>
            ) : dashboardQuery.isError ? (
              <p className="text-red-600">Unable to load dashboard status.</p>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200 p-5">
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Health Status</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">
                      {dashboardQuery.data?.systemHealth?.status ?? "unknown"}
                    </p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 p-5">
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Pending Workflows</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">
                      {dashboardQuery.data?.automation?.pendingWorkflows ?? 0}
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-3xl border border-slate-200 p-5">
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Queue Count</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">
                      {dashboardQuery.data?.queues?.length ?? 0}
                    </p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 p-5">
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Heap Used</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">
                      {dashboardQuery.data?.performance?.memory?.heapUsed ?? 0} MB
                    </p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 p-5">
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Uptime</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">
                      {Math.round(dashboardQuery.data?.performance?.uptime ?? 0)}s
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="rounded-[2rem] bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">System Info</h2>
            {systemInfoQuery.isLoading ? (
              <p>Loading system info...</p>
            ) : systemInfoQuery.isError ? (
              <p className="text-red-600">Unable to load system information.</p>
            ) : (
              <div className="space-y-4 text-slate-700">
                <div>
                  <p className="text-sm text-slate-500">Environment</p>
                  <p>{systemInfoQuery.data?.environment ?? "unknown"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Node Version</p>
                  <p>{systemInfoQuery.data?.nodeVersion ?? "unknown"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Last Health Check</p>
                  <p>{new Date(systemInfoQuery.data?.timestamp ?? Date.now()).toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        <AdminErpTabs />

        <section className="rounded-[2rem] bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-semibold text-slate-900">Pending Approval Workflows</h2>
            <Button onClick={() => void workflowsQuery.refetch()}>Refresh</Button>
          </div>

          {workflowsQuery.isLoading ? (
            <p className="mt-4">Loading pending workflows...</p>
          ) : workflowsQuery.isError ? (
            <p className="mt-4 text-red-600">Unable to load pending workflows.</p>
          ) : workflows.length === 0 ? (
            <p className="mt-4 text-slate-600">No workflows are awaiting approval.</p>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-700">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-3 pr-6 font-semibold">Workflow ID</th>
                    <th className="py-3 pr-6 font-semibold">Type</th>
                    <th className="py-3 pr-6 font-semibold">Student</th>
                    <th className="py-3 pr-6 font-semibold">Created</th>
                    <th className="py-3 pr-6 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {workflows.map((workflow) => (
                    <tr key={workflow.id} className="border-b border-slate-100">
                      <td className="py-4 pr-6 font-medium text-slate-900">{workflow.id}</td>
                      <td className="py-4 pr-6 text-slate-700">{workflow.workflowType}</td>
                      <td className="py-4 pr-6 text-slate-700">{workflow.studentId}</td>
                      <td className="py-4 pr-6 text-slate-700">
                        {new Date(workflow.createdAt).toLocaleString()}
                      </td>
                      <td className="py-4 pr-6 space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(workflow.id)}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void handleReject(workflow.id)}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                        >
                          Reject
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
