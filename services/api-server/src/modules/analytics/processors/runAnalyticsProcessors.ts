import type { AuthenticatedPrincipal } from "@toppers/auth";
import { generateAttendanceSnapshot } from "../snapshots/snapshotGenerator";
import { createAIDraftSummaries } from "../ai/aiDraftSummarizer";
import type { AnalyticsSnapshotDomain } from "../snapshots/snapshotTypes";

export async function runAnalyticsProcessors(options: {
  auth: AuthenticatedPrincipal;
  tenantId: string;
  domain: AnalyticsSnapshotDomain;
  studentId?: string;
  classId?: string;
  section?: string | null;
  period: string; // YYYY-MM
}) {
  // Systems boundary: orchestrate processors without embedding calculations in controllers.
  const { auth, tenantId, domain, studentId, classId, section, period } = options;

  switch (domain) {
    case "attendance_analytics": {
      if (!studentId) throw new Error("studentId_required");
      await generateAttendanceSnapshot({
        auth,
        tenantId,
        studentId,
        classId,
        section,
        aggregatePeriod: period,
      });

      // AI-ready dataset: minimal dataset shape; derived from analytics sources.
      await createAIDraftSummaries({
        auth,
        tenantId,
        domain,
        period,
        targetStudentId: studentId,
        dataset: {
          facts: [],
        },
      });
      return;
    }
    default:
      throw new Error(`Unsupported analytics domain: ${domain}`);
  }
}

