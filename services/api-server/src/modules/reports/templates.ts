import fs from "fs/promises";
import path from "path";

export interface ReportTemplateData {
  studentCode: string;
  fullName: string;
  classSection: string;
  month: string;
  generatedAt: string;
  teacherName: string;
  teacherNote: string;
  strengths: string[];
  weaknesses: string[];
  attendancePercentage: number | null;
  totalDays: number | null;
  presentDays: number | null;
  absentDays: number | null;
  performanceRowsHtml: string;
  subjectProgressRowsHtml: string;
  academicSummary: string;
}

const templatePath = path.resolve(__dirname, "../templates/report.html");

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderRows(items: string[]) {
  if (items.length === 0) {
    return "<p class=\"section-empty\">No details available.</p>";
  }

  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

export async function renderProgressReportTemplate(
  data: ReportTemplateData,
): Promise<string> {
  const template = await fs.readFile(templatePath, "utf8");

  return template
    .replace("{{studentName}}", escapeHtml(data.fullName))
    .replace("{{studentCode}}", escapeHtml(data.studentCode))
    .replace("{{classSection}}", escapeHtml(data.classSection))
    .replace("{{month}}", escapeHtml(data.month))
    .replace("{{generatedAt}}", escapeHtml(data.generatedAt))
    .replace("{{teacherName}}", escapeHtml(data.teacherName))
    .replace("{{teacherNote}}", escapeHtml(data.teacherNote))
    .replace("{{strengthsList}}", renderRows(data.strengths))
    .replace("{{weaknessesList}}", renderRows(data.weaknesses))
    .replace(
      "{{attendancePercentage}}",
      data.attendancePercentage === null
        ? "N/A"
        : String(data.attendancePercentage),
    )
    .replace(
      "{{totalDays}}",
      data.totalDays === null ? "N/A" : String(data.totalDays),
    )
    .replace(
      "{{presentDays}}",
      data.presentDays === null ? "N/A" : String(data.presentDays),
    )
    .replace(
      "{{absentDays}}",
      data.absentDays === null ? "N/A" : String(data.absentDays),
    )
    .replace(
      "{{academicSummary}}",
      escapeHtml(data.academicSummary),
    )
    .replace("{{performanceRows}}", data.performanceRowsHtml)
    .replace("{{subjectProgressRows}}", data.subjectProgressRowsHtml);
}
