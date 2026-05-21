import { z } from "zod";

const monthString = z
  .string()
  .trim()
  .regex(/^[0-9]{4}-(0[1-9]|1[0-2])$/, "Invalid month format. Use YYYY-MM.");

const nonEmptyString = z.string().trim().min(1);

const reportSubjectProgressItemSchema = z.object({
  subject: nonEmptyString.max(128),
  grade: nonEmptyString.max(16),
  remarks: z.string().trim().max(512).optional(),
});

export const reportGenerateRequestSchema = z.object({
  studentId: z.string().uuid(),
  month: monthString,
  teacherNote: z.string().trim().min(1).max(2048),
  strengths: z.array(z.string().trim().min(1).max(256)).min(1).max(10),
  weaknesses: z.array(z.string().trim().min(1).max(256)).min(1).max(10),
  academicProgress: z
    .object({
      summary: z.string().trim().min(1).max(2048),
      subjects: z.array(reportSubjectProgressItemSchema).max(8).optional(),
    })
    .optional(),
});

export const reportDownloadParamsSchema = z.object({
  reportId: z.string().uuid(),
});

export const reportStudentParamsSchema = z.object({
  studentId: z.string().uuid(),
});

export type ReportGenerateRequest = z.infer<typeof reportGenerateRequestSchema>;
export type ReportDownloadParams = z.infer<
  typeof reportDownloadParamsSchema
>;
export type ReportStudentParams = z.infer<
  typeof reportStudentParamsSchema
>;
