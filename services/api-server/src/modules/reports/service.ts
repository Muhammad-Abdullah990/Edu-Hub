import fs from "fs/promises";
import path from "path";
import { ROLE_NAMES, type AuthenticatedPrincipal } from "@toppers/auth";
import type { ReportGenerateRequest } from "@toppers/validations";
import { auditService } from "../audit/service";
import { attendanceRepository } from "../attendance/repository";
import { parentsRepository } from "../parents/repository";
import { studentsRepository } from "../students/repository";
import { reportsRepository } from "./repository";
import { renderProgressReportTemplate } from "./templates";
import { htmlToPdfBuffer } from "./pdf/engine";
import { HttpError } from "../../lib/http-error";
import type { ReportJobResponse, ReportListItem } from "./types";

const REPORT_STORAGE_BASE = path.resolve(process.cwd(), "storage", "reports");

function buildReportFilePath(studentId: string, month: string) {
  return path.join(REPORT_STORAGE_BASE, studentId, `${month}.pdf`);
}

function verifyStudentAccess(auth: AuthenticatedPrincipal, studentId: string) {
  if (auth.roles.includes(ROLE_NAMES.PARENT)) {
    return parentsRepository.isParentLinkedToStudent(auth.userId, studentId);
  }

  return Promise.resolve(
    auth.roles.some(
      (role) =>
        role === ROLE_NAMES.SUPER_ADMIN ||
        role === ROLE_NAMES.ADMIN ||
        role === ROLE_NAMES.TEACHER,
    ),
  );
}

const generationQueue: Array<{
  reportId: string;
  auth: AuthenticatedPrincipal;
  input: ReportGenerateRequest;
}> = [];
let queueRunning = false;

async function processQueue() {
  if (queueRunning) {
    return;
  }

  queueRunning = true;

  while (generationQueue.length > 0) {
    const job = generationQueue.shift()!;

    try {
      await executeReportGeneration(job.reportId, job.auth, job.input);
    } catch (error) {
      console.error("Failed to generate report", error);
    }
  }

  queueRunning = false;
}

function enqueueReportGeneration(
  reportId: string,
  auth: AuthenticatedPrincipal,
  input: ReportGenerateRequest,
) {
  generationQueue.push({ reportId, auth, input });
  void processQueue();
}

async function ensureStudentAccess(auth: AuthenticatedPrincipal, studentId: string) {
  const hasAccess = await verifyStudentAccess(auth, studentId);

  if (!hasAccess) {
    throw new HttpError(
      403,
      "REPORT_FORBIDDEN",
      "User does not have permission to access student reports",
    );
  }
}

function buildPerformanceRowsHtml(notes: Array<{ note: string; authorName: string | null; createdAt: string }>) {
  if (notes.length === 0) {
    return "<tr><td colspan=3 class=\"section-empty\">No performance notes available.</td></tr>";
  }

  return notes
    .map(
      (note) =>
        `<tr><td>${escapeHtml(note.createdAt)}</td><td>${escapeHtml(
          note.authorName ?? "Unknown",
        )}</td><td>${escapeHtml(note.note)}</td></tr>`,
    )
    .join("");
}

function buildSubjectProgressRowsHtml(subjects: Array<{ subject: string; grade: string; remarks?: string }>) {
  if (subjects.length === 0) {
    return "<tr><td colspan=3 class=\"section-empty\">No subject progress details available.</td></tr>";
  }

  return subjects
    .map(
      (item) =>
        `<tr><td>${escapeHtml(item.subject)}</td><td>${escapeHtml(item.grade)}</td><td>${escapeHtml(item.remarks ?? "")}</td></tr>`,
    )
    .join("");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function executeReportGeneration(
  reportId: string,
  auth: AuthenticatedPrincipal,
  input: ReportGenerateRequest,
) {
  const reportRecord = await reportsRepository.findReportById(reportId);

  if (!reportRecord) {
    throw new Error("Report record not found");
  }

  const student = await studentsRepository.findStudentById(reportRecord.studentId);
  if (!student) {
    throw new Error("Student record not found");
  }

  const attendanceRows = await attendanceRepository.findAttendanceForStudent(
    reportRecord.studentId,
  );

  const monthlyAttendance = attendanceRows.filter((item) =>
    item.date.startsWith(reportRecord.month),
  );

  const presentDays = monthlyAttendance.filter(
    (item) => item.status === "present",
  ).length;
  const absentDays = monthlyAttendance.filter(
    (item) => item.status === "absent",
  ).length;
  const totalDays = monthlyAttendance.length;
  const attendancePercentage = totalDays > 0
    ? Math.round((presentDays / totalDays) * 100)
    : null;

  const performanceNotes = await studentsRepository.findPerformanceNotesForStudent(
    student.id,
  );

  const performanceRowsHtml = buildPerformanceRowsHtml(
    performanceNotes.map((note) => ({
      note: note.note,
      authorName: note.author?.name ?? null,
      createdAt: note.createdAt.toISOString(),
    })),
  );

  const subjectProgressRowsHtml = buildSubjectProgressRowsHtml(
    input.academicProgress?.subjects ?? [],
  );

  const html = await renderProgressReportTemplate({
    studentCode: student.studentCode,
    fullName: student.fullName,
    classSection: `${student.class} / ${student.section}`,
    month: reportRecord.month,
    generatedAt: new Date().toISOString(),
    teacherName: auth.email ?? "Teacher",
    teacherNote: input.teacherNote,
    strengths: input.strengths,
    weaknesses: input.weaknesses,
    attendancePercentage,
    totalDays: totalDays || null,
    presentDays: totalDays > 0 ? presentDays : null,
    absentDays: totalDays > 0 ? absentDays : null,
    performanceRowsHtml,
    subjectProgressRowsHtml,
    academicSummary:
      input.academicProgress?.summary ??
      "Academic progress is not available for this reporting period.",
  });

  const pdfBuffer = await htmlToPdfBuffer(html);
  const pathToSave = buildReportFilePath(student.id, reportRecord.month);

  await fs.mkdir(path.dirname(pathToSave), { recursive: true });
  await fs.writeFile(pathToSave, pdfBuffer);

  await reportsRepository.updateReport(reportId, {
    status: "complete",
    generatedPdfPath: pathToSave,
    errorMessage: null,
  });

  await auditService.log({
    userId: auth.userId,
    action: "report.generate",
    entityType: "progress_report",
    entityId: reportId,
    metadata: {
      studentId: student.id,
      month: reportRecord.month,
      status: "complete",
    },
  });
}

export function createReportsService() {
  return {
    async queueReportGeneration(
      auth: AuthenticatedPrincipal,
      input: ReportGenerateRequest,
    ): Promise<ReportJobResponse> {
      const existingReport = await reportsRepository.findReportByStudentMonth(
        input.studentId,
        input.month,
      );

      if (existingReport) {
        throw new HttpError(
          409,
          "REPORT_EXISTS",
          "A progress report already exists for this student and month",
        );
      }

      const record = await reportsRepository.createReport({
        studentId: input.studentId,
        month: input.month,
        teacherNote: input.teacherNote,
        strengths: input.strengths,
        weaknesses: input.weaknesses,
        academicProgress: input.academicProgress ?? {},
        status: "pending",
      });

      enqueueReportGeneration(record.id, auth, input);

      return {
        reportId: record.id,
        status: "pending",
        message: "Report generation queued successfully",
      };
    },

    async getReportsByStudent(
      auth: AuthenticatedPrincipal,
      studentId: string,
    ): Promise<ReportListItem[]> {
      const student = await studentsRepository.findStudentById(studentId);
      if (!student) {
        throw new HttpError(
          404,
          "STUDENT_NOT_FOUND",
          "Student not found",
        );
      }

      await ensureStudentAccess(auth, studentId);

      const reports = await reportsRepository.findReportsByStudentId(studentId);

      return reports.map((report) => ({
        id: report.id,
        studentId: report.studentId,
        month: report.month,
        status: report.status,
        generatedPdfPath: report.generatedPdfPath,
        createdAt: report.createdAt.toISOString(),
        updatedAt: report.updatedAt.toISOString(),
      }));
    },

    async getReportById(auth: AuthenticatedPrincipal, reportId: string) {
      const report = await reportsRepository.findReportById(reportId);
      if (!report) {
        throw new HttpError(404, "REPORT_NOT_FOUND", "Report not found");
      }

      await ensureStudentAccess(auth, report.studentId);

      if (report.status !== "complete" || !report.generatedPdfPath) {
        throw new HttpError(
          409,
          "REPORT_NOT_READY",
          "Report PDF is not ready for download yet",
        );
      }

      return report;
    },
  };
}

export const reportsService = createReportsService();
